# menu/serializers.py
from rest_framework import serializers
from .models import MenuCategory, MenuItem, MenuItemVariant


class MenuCategorySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = MenuCategory
        fields = ["id", "name", "slug", "sort_order"]


class MenuItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    category = serializers.CharField(source="category.id", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "normalized_name",
            "category",
            "category_name",
            "category_slug",
            "default_unit",
            "is_active",
        ]


class MenuItemVariantSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    item = serializers.CharField(source="item.id", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)
    item_normalized = serializers.CharField(source="item.normalized_name", read_only=True)
    category = serializers.CharField(source="item.category.slug", read_only=True)
    category_name = serializers.CharField(source="item.category.name", read_only=True)

    class Meta:
        model = MenuItemVariant
        fields = [
            "id",
            "item",
            "item_name",
            "item_normalized",
            "category",
            "category_name",
            "size_value",
            "size_unit",
            "label",
        ]


class VariantSearchSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    item_id = serializers.CharField(source="item.id", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)
    item_normalized = serializers.CharField(source="item.normalized_name", read_only=True)
    category = serializers.CharField(source="item.category.slug", read_only=True)
    category_name = serializers.CharField(source="item.category.name", read_only=True)

    class Meta:
        model = MenuItemVariant
        fields = [
            "id",          # variant ID
            "item_id",     # item ID
            "item_name",
            "item_normalized",
            "category",
            "category_name",
            "size_value",
            "size_unit",
            "label",
        ]


class MenuItemDetailSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    category = serializers.CharField(source="category.id", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    variants = MenuItemVariantSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "normalized_name",
            "category",
            "category_name",
            "default_unit",
            "is_active",
            "variants",
        ]