# menu/views.py
from rest_framework import viewsets, filters
from rest_framework.generics import ListAPIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q

from .models import MenuCategory, MenuItem, MenuItemVariant
from .serializers import (
    MenuCategorySerializer,
    MenuItemSerializer,
    MenuItemVariantSerializer,
    VariantSearchSerializer,
    MenuItemDetailSerializer,
)


class MenuItemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Menu itemlarni ko'rish uchun API
    GET /api/menu/items/ - barcha itemlar
    GET /api/menu/items/<id>/ - bitta item detallari (variantlari bilan)
    GET /api/menu/items/by_category/<slug>/ - kategoriya bo'yicha filter
    """
    permission_classes = [AllowAny]
    serializer_class = MenuItemSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "normalized_name"]

    def get_queryset(self):
        queryset = MenuItem.objects.filter(is_active=True).select_related("category")

        category = (self.request.query_params.get("category") or "").strip()
        if category:
            queryset = queryset.filter(category__slug=category)

        return queryset.order_by("category__sort_order", "name")

    @action(detail=False, url_path="by_category/(?P<category_slug>[^/.]+)")
    def by_category(self, request, category_slug=None):
        items = self.get_queryset().filter(category__slug=category_slug)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def variants(self, request, pk=None):
        item = self.get_object()
        variants = item.variants.all().order_by("size_value", "label")
        serializer = MenuItemVariantSerializer(variants, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = MenuItemDetailSerializer(instance)
        return Response(serializer.data)


class MenuItemVariantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Variantlarni ko'rish uchun API
    GET /api/menu/variants/ - barcha variantlar
    GET /api/menu/variants/<id>/ - bitta variant
    """
    permission_classes = [AllowAny]
    serializer_class = MenuItemVariantSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["item__name", "item__normalized_name", "label"]

    def get_queryset(self):
        queryset = MenuItemVariant.objects.select_related(
            "item", "item__category"
        ).filter(item__is_active=True)

        item_id = (self.request.query_params.get("item") or "").strip()
        if item_id:
            queryset = queryset.filter(item_id=item_id)

        category = (self.request.query_params.get("category") or "").strip()
        if category:
            queryset = queryset.filter(item__category__slug=category)

        unit = (self.request.query_params.get("unit") or "").strip()
        if unit:
            queryset = queryset.filter(size_unit=unit)

        return queryset.order_by("item__name", "size_value", "label")


class VariantSearchView(ListAPIView):
    """
    GET /api/menu/search/variants/?q=cappuccino
    Search natijada bir xil item bir necha marta chiqmasligi kerak.
    User itemni tanlaydi, keyin uning variantlari alohida endpointdan olinadi.
    """
    permission_classes = [AllowAny]
    serializer_class = VariantSearchSerializer

    def get_queryset(self):
        q = (self.request.query_params.get("q") or "").strip()
        category = (self.request.query_params.get("category") or "").strip()

        qs = MenuItemVariant.objects.select_related(
            "item", "item__category"
        ).filter(item__is_active=True)

        if category:
            qs = qs.filter(item__category__slug=category)

        if q:
            qs = qs.filter(
                Q(item__name__icontains=q) |
                Q(item__normalized_name__icontains=q) |
                Q(label__icontains=q)
            )

        # Get the first variant ID for each unique item_id.
        # This standard ORM approach is database-independent and works on both SQLite and PostgreSQL.
        from django.db.models import Min
        first_variant_ids = qs.values("item_id").annotate(min_id=Min("id")).values_list("min_id", flat=True)

        return MenuItemVariant.objects.select_related(
            "item", "item__category"
        ).filter(
            id__in=first_variant_ids
        ).order_by("item__name", "size_value", "label")[:20]


class MenuCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Kategoriyalarni ko'rish uchun API
    GET /api/menu/categories/ - barcha kategoriyalar
    """
    permission_classes = [AllowAny]
    queryset = MenuCategory.objects.all().order_by("sort_order", "name")
    serializer_class = MenuCategorySerializer
    lookup_field = "slug"