import math
from datetime import timedelta

from django.utils import timezone
from django.db.models import F, FloatField, ExpressionWrapper
from django.db.models.functions import ACos, Cos, Radians, Sin

from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated

from menu.models import MenuItemVariant
from .models import PriceSubmission, MenuItemPrice, FavoriteVariant
from .serializers import (
    PriceSubmissionCreateSerializer,
    PriceSubmissionListSerializer,
    ComparePriceSerializer,
    FavoriteVariantSerializer,
)


from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsOwner
from places.models import Restaurant
from .models import MenuItemPrice
from .serializers import OwnerPriceUpsertSerializer, OwnerRestaurantPriceListSerializer



class ComparePriceView(ListAPIView):
    """
    GET /api/compare/?variant=<variant_uuid>
    Variant bo'yicha narxlarni qaytaradi
    """
    serializer_class = ComparePriceSerializer

    def get_queryset(self):
        variant_id = self.request.query_params.get("variant")

        queryset = MenuItemPrice.objects.select_related(
            "restaurant",
            "variant",
            "variant__item"
        )

        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)
        else:
            raise ValidationError({"detail": "Required: ?variant=<variant_uuid>"})

        return queryset.order_by("price_amount")


class CompareByItemView(ListAPIView):
    """
    GET /api/compare2/?item=cappuccino&size=250&unit=ml
    Item nomi, size va unit bo'yicha variant topib, narxlarni qaytaradi
    """
    serializer_class = ComparePriceSerializer

    def get_queryset(self):
        item = self.request.query_params.get("item")  # normalized_name
        size = self.request.query_params.get("size")
        unit = self.request.query_params.get("unit")

        if not item or not size or not unit:
            raise ValidationError({
                "detail": "Required: ?item=cappuccino&size=250&unit=ml"
            })

        try:
            size_int = int(size)
        except ValueError:
            raise ValidationError({"size": "size must be integer (e.g. 250)"})

        variant = MenuItemVariant.objects.select_related("item").filter(
            item__normalized_name=item,
            size_value=size_int,
            size_unit=unit
        ).first()

        if not variant:
            raise ValidationError({"detail": "Variant not found for given item/size/unit"})

        return (
            MenuItemPrice.objects
            .select_related("restaurant", "variant", "variant__item")
            .filter(variant=variant)
            .order_by("price_amount")
        )


class PriceSubmissionCreateView(CreateAPIView):
    """
    POST /api/submissions/
    Oddiy foydalanuvchilar narx taklif qilishi uchun
    Rate limit: 1 soatda 1 ta submission
    """
    queryset = PriceSubmission.objects.all()
    serializer_class = PriceSubmissionCreateSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        ip = self.request.META.get("REMOTE_ADDR")

        # Rate limiting: 1 soatda 1 ta submission
        one_hour_ago = timezone.now() - timedelta(hours=1)

        qs = PriceSubmission.objects.filter(created_at__gte=one_hour_ago)
        if user:
            qs = qs.filter(submitted_by=user)
        else:
            # IP bo'yicha cheklash (MVP uchun hack)
            qs = qs.filter(note__startswith=f"ip:{ip}|")

        if qs.exists():
            raise ValidationError({"detail": "Too many submissions. Try again in ~1 hour."})

        note = serializer.validated_data.get("note") or ""
        if not user:
            note = f"ip:{ip}|{note}".strip()

        serializer.save(submitted_by=user, note=note)


class MySubmissionsView(ListAPIView):
    """
    GET /api/my-submissions/
    Foydalanuvchining o'z submissionlarini ko'rish
    """
    serializer_class = PriceSubmissionListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            PriceSubmission.objects
            .select_related("restaurant", "variant", "variant__item")
            .filter(submitted_by=self.request.user)
            .order_by("-created_at")
        )


class AdminPendingSubmissionsView(ListAPIView):
    """
    GET /api/admin/submissions/?status=pending
    Admin uchun submissionlarni boshqarish
    """
    serializer_class = PriceSubmissionListSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        status_ = self.request.query_params.get("status", "pending")
        return (
            PriceSubmission.objects
            .select_related("restaurant", "variant", "variant__item")
            .filter(status=status_)
            .order_by("-created_at")
        )


class ApproveSubmissionView(APIView):
    """
    POST /api/admin/submissions/<uuid>/approve/
    Submissionni approve qilish va MenuItemPrice ga qo'shish
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, submission_id):

        sub = PriceSubmission.objects.select_related("restaurant", "variant").filter(id=submission_id).first()
        if not sub:
            raise ValidationError({"detail": "Submission not found"})

        if sub.status != "pending":
            raise ValidationError({"detail": "Only pending submissions can be approved"})

        # Upsert price (Restaurant + Variant unique)
        price_obj, created = MenuItemPrice.objects.get_or_create(
            restaurant=sub.restaurant,
            variant=sub.variant,
            defaults={
                "price_amount": sub.submitted_price,
                "is_verified": True,
                "source_type": "community",
            }
        )
        if not created:
            price_obj.price_amount = sub.submitted_price
            price_obj.is_verified = True
            price_obj.source_type = "community"
            price_obj.save(update_fields=["price_amount", "is_verified", "source_type", "updated_at"])

        sub.status = "approved"
        sub.reviewed_by = request.user
        sub.reviewed_at = timezone.now()
        sub.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        return Response({"detail": "approved", "price_id": price_obj.id})


class RejectSubmissionView(APIView):
    """
    POST /api/admin/submissions/<uuid>/reject/
    Submissionni reject qilish
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, submission_id):
        sub = PriceSubmission.objects.filter(id=submission_id).first()
        if not sub:
            raise ValidationError({"detail": "Submission not found"})

        if sub.status != "pending":
            raise ValidationError({"detail": "Only pending submissions can be rejected"})

        sub.status = "rejected"
        sub.reviewed_by = request.user
        sub.reviewed_at = timezone.now()
        sub.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        return Response({"detail": "rejected"})


class NearbyCompareView(ListAPIView):
    """
    GET /api/nearby/compare/?item=cappuccino&size=250&unit=ml&lat=41.31&lng=69.28&radius_km=3
    Yaqin restoranlardagi narxlarni masofa va narx bo'yicha score bilan qaytaradi
    """
    serializer_class = ComparePriceSerializer

    def get_queryset(self):
        # Query parametrlarni olish
        item = (self.request.query_params.get("item") or "").strip()
        size = self.request.query_params.get("size")
        unit = (self.request.query_params.get("unit") or "").strip()
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        radius_km = self.request.query_params.get("radius_km", "3")
        verified_only = (self.request.query_params.get("verified_only", "0") or "").lower()
        max_price = self.request.query_params.get("max_price")
        top = self.request.query_params.get("top", "20")
        distance_weight = self.request.query_params.get("distance_weight", "2000")

        # Majburiy parametrlarni tekshirish
        if not item or not size or not unit or not lat or not lng:
            raise ValidationError({
                "detail": "Required: ?item=cappuccino&size=250&unit=ml&lat=41.31&lng=69.28&radius_km=3"
            })

        # Parametrlarni to'g'ri formatga o'tkazish
        try:
            size_int = int(size)
            lat = float(lat)
            lng = float(lng)
            radius_km = float(radius_km)
            distance_weight = float(distance_weight)
            top = int(top)
        except ValueError:
            raise ValidationError({
                "detail": "size/top must be int; lat/lng/radius_km/distance_weight must be numbers"
            })

        # Validatsiya
        if radius_km <= 0 or radius_km > 50:
            raise ValidationError({"radius_km": "radius_km must be between 0 and 50 for MVP"})

        if top < 1 or top > 100:
            raise ValidationError({"top": "top must be between 1 and 100"})

        # Variantni topish
        variant = MenuItemVariant.objects.select_related("item").filter(
            item__normalized_name=item,
            size_value=size_int,
            size_unit=unit
        ).first()

        if not variant:
            raise ValidationError({"detail": "Variant not found for given item/size/unit"})

        # Bounding box hisoblash
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)) + 1e-9)

        # Asosiy queryset
        qs = (
            MenuItemPrice.objects
            .select_related("restaurant", "variant", "variant__item")
            .filter(
                variant=variant,
                restaurant__is_active=True,
                restaurant__lat__isnull=False,
                restaurant__lng__isnull=False,
                restaurant__lat__gte=lat - lat_delta,
                restaurant__lat__lte=lat + lat_delta,
                restaurant__lng__gte=lng - lng_delta,
                restaurant__lng__lte=lng + lng_delta,
            )
        )

        # Filterlar
        if verified_only in ("1", "true", "yes"):
            qs = qs.filter(is_verified=True)

        if max_price:
            try:
                max_price_int = int(max_price)
                qs = qs.filter(price_amount__lte=max_price_int)
            except ValueError:
                raise ValidationError({"max_price": "max_price must be integer"})

        # Masofani hisoblash va score qo'shish
        qs = qs.annotate(
            distance_km=ExpressionWrapper(
                6371 * ACos(
                    Cos(Radians(lat)) *
                    Cos(Radians(F("restaurant__lat"))) *
                    Cos(Radians(F("restaurant__lng")) - Radians(lng)) +
                    Sin(Radians(lat)) *
                    Sin(Radians(F("restaurant__lat")))
                ),
                output_field=FloatField()
            ),
        ).annotate(
            score=ExpressionWrapper(
                F("price_amount") + (F("distance_km") * distance_weight),
                output_field=FloatField()
            )
        ).order_by("score", "price_amount")

        return qs[:top]


class FavoriteListCreateView(CreateAPIView, ListAPIView):
    """
    GET /api/favorites/ - Favoritlar ro'yxati
    POST /api/favorites/ - Yangi favorit qo'shish
    """
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteVariantSerializer

    def get_queryset(self):
        return (
            FavoriteVariant.objects
            .select_related("variant", "variant__item")
            .filter(user=self.request.user)
            .order_by("-created_at")
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDeleteView(DestroyAPIView):
    """
    DELETE /api/favorites/<variant_id>/
    Favoritni o'chirish
    """
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "variant_id"

    def get_object(self):
        variant_id = self.kwargs.get("variant_id")
        obj = FavoriteVariant.objects.filter(
            user=self.request.user,
            variant_id=variant_id
        ).first()

        if not obj:
            raise ValidationError({"detail": "Favorite not found"})
        return obj

class OwnerPriceUpsertView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request):
        serializer = OwnerPriceUpsertSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(
            OwnerRestaurantPriceListSerializer(obj).data,
            status=status.HTTP_200_OK,
        )


class OwnerMyPricesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = OwnerRestaurantPriceListSerializer

    def get_queryset(self):
        restaurant = Restaurant.objects.filter(owner=self.request.user).first()
        if not restaurant:
            return MenuItemPrice.objects.none()

        return (
            MenuItemPrice.objects.filter(restaurant=restaurant)
            .select_related("restaurant", "variant", "variant__item", "variant__item__category")
            .order_by("variant__item__name", "variant__size_value")
        )