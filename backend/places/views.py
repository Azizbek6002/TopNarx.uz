import math
from django.db.models import Sum, Case, When, Value, IntegerField, F
from django.db.models.functions import Coalesce
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .serializers import RestaurantRecommendSerializer
from .recommendation import USE_CASE_FEATURES


from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from .models import Restaurant, Tag
from .serializers import RestaurantSerializer, TagSerializer


from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsOwner
from .models import Restaurant
from .serializers import RestaurantSerializer, OwnerRestaurantCreateSerializer



class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Restaurant.objects.filter(is_active=True).order_by("name")
    serializer_class = RestaurantSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_active"]
    search_fields = ["name", "slug", "address_text"]

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    search_fields = ["name", "slug"]


class NearbyRecommendView(ListAPIView):
    serializer_class = RestaurantRecommendSerializer

    def get_queryset(self):
        use_case = (self.request.query_params.get("use_case") or "").strip().lower()
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        radius_km = self.request.query_params.get("radius_km", "3")

        if use_case not in USE_CASE_FEATURES:
            raise ValidationError({"use_case": f"Invalid. Choose one of: {list(USE_CASE_FEATURES.keys())}"})

        if not lat or not lng:
            raise ValidationError({"detail": "Required: ?use_case=work&lat=...&lng=...&radius_km=3"})

        try:
            lat = float(lat)
            lng = float(lng)
            radius_km = float(radius_km)
        except ValueError:
            raise ValidationError({"detail": "lat/lng/radius_km must be numbers"})

        if radius_km <= 0 or radius_km > 50:
            raise ValidationError({"radius_km": "radius_km must be between 0 and 50 for MVP"})

        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)) + 1e-9)

        weights = USE_CASE_FEATURES[use_case]  # {"wifi":10, ...}

        qs = Restaurant.objects.filter(
            is_active=True,
            lat__isnull=False,
            lng__isnull=False,
            lat__gte=lat - lat_delta,
            lat__lte=lat + lat_delta,
            lng__gte=lng - lng_delta,
            lng__lte=lng + lng_delta,
        ).annotate(
            recommend_score=Coalesce(
                Sum(
                    Case(
                        *[
                            When(
                                features__feature__slug=slug,
                                then=Value(usecase_weight) * F("features__weight")
                            )
                            for slug, usecase_weight in weights.items()
                        ],
                        default=Value(0),
                        output_field=IntegerField(),
                    ),
                    output_field=IntegerField(),
                ),
                Value(0),
            )
        ).order_by("-recommend_score", "name").distinct()

        return qs

class NearbyRestaurantsView(ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]


    def get_queryset(self):
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        radius_km = self.request.query_params.get("radius_km", "3")

        if not lat or not lng:
            raise ValidationError({"detail": "Required: ?lat=41.31&lng=69.28&radius_km=3"})

        try:
            lat = float(lat)
            lng = float(lng)
            radius_km = float(radius_km)
        except ValueError:
            raise ValidationError({"detail": "lat/lng/radius_km must be numbers"})

        if radius_km <= 0 or radius_km > 50:
            raise ValidationError({"radius_km": "radius_km must be between 0 and 50 for MVP"})

        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)) + 1e-9)

        return Restaurant.objects.filter(
            is_active=True,
            lat__isnull=False,
            lng__isnull=False,
            lat__gte=lat - lat_delta,
            lat__lte=lat + lat_delta,
            lng__gte=lng - lng_delta,
            lng__lte=lng + lng_delta,
        ).order_by("name")

class OwnerMyRestaurantView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = OwnerRestaurantCreateSerializer

    def get(self, request, *args, **kwargs):
        restaurant = Restaurant.objects.filter(owner=request.user).first()
        if not restaurant:
            return Response(
                {"detail": "Sizga biriktirilgan restoran topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(RestaurantSerializer(restaurant).data)

    def post(self, request, *args, **kwargs):
        existing_restaurant = Restaurant.objects.filter(owner=request.user).first()
        if existing_restaurant:
            return Response(
                {"detail": "Sizda allaqachon restoran mavjud."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        restaurant = serializer.save(owner=request.user)

        return Response(
            RestaurantSerializer(restaurant).data,
            status=status.HTTP_201_CREATED,
        )

    def put(self, request, *args, **kwargs):
        restaurant = Restaurant.objects.filter(owner=request.user).first()
        if not restaurant:
            return Response(
                {"detail": "Tahrirlash uchun restoran topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(restaurant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        restaurant = serializer.save()

        return Response(RestaurantSerializer(restaurant).data)