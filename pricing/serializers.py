from .models import MenuItemPrice, PriceSubmission
from .models import FavoriteVariant
from rest_framework import serializers



from rest_framework import serializers
from .models import MenuItemPrice
from menu.models import MenuItemVariant
from places.models import Restaurant


class ComparePriceSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source="restaurant.name")
    item_name = serializers.CharField(source="variant.item.name")
    variant_label = serializers.CharField(source="variant.label")
    distance_km = serializers.FloatField(read_only=True)
    variant_uuid = serializers.UUIDField(source="variant.id", read_only=True)

    score = serializers.FloatField(read_only=True)


    class Meta:
        model = MenuItemPrice
        fields = [
            "restaurant_name",
            "item_name",
            "variant_label",
            "price_amount",
            "distance_km",
            "is_verified",
            "variant_uuid",

            "score",

        ]

class PriceSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceSubmission
        fields = ["restaurant", "variant", "submitted_price", "note"]

    def validate(self, attrs):
        restaurant = attrs["restaurant"]
        variant = attrs["variant"]

        if PriceSubmission.objects.filter(
            restaurant=restaurant, variant=variant, status="pending"
        ).exists():
            raise serializers.ValidationError("Pending submission already exists for this restaurant & variant.")

        return attrs


class PriceSubmissionListSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source="restaurant.name")
    item_name = serializers.CharField(source="variant.item.name")
    variant_label = serializers.CharField(source="variant.label")

    class Meta:
        model = PriceSubmission
        fields = [
            "id",
            "restaurant", "restaurant_name",
            "variant", "item_name", "variant_label",
            "submitted_price", "note",
            "status",
            "created_at",
        ]



class FavoriteVariantSerializer(serializers.ModelSerializer):
    # POST uchun
    variant_id = serializers.UUIDField(write_only=True)

    # RESPONSE uchun (DELETE qilish oson bo‘lsin)
    variant_uuid = serializers.UUIDField(source="variant.id", read_only=True)

    item_name = serializers.CharField(source="variant.item.name", read_only=True)
    normalized_name = serializers.CharField(source="variant.item.normalized_name", read_only=True)

    variant_label = serializers.SerializerMethodField()

    class Meta:
        model = FavoriteVariant
        fields = [
            "id",
            "variant_id",      # write_only
            "variant_uuid",    # read_only
            "item_name",
            "normalized_name",
            "variant_label",
            "created_at",
        ]

    def get_variant_label(self, obj):
        v = obj.variant
        # sizda label bo‘lmasa ham size_value/unit bor
        label = getattr(v, "label", None)
        if label:
            return label
        return f"{getattr(v, 'size_value', '')}{getattr(v, 'size_unit', '')}"

    def create(self, validated_data):
        user = self.context["request"].user
        variant_id = validated_data["variant_id"]
        obj, _ = FavoriteVariant.objects.get_or_create(user=user, variant_id=variant_id)
        return obj

class OwnerPriceUpsertSerializer(serializers.Serializer):
    variant_id = serializers.UUIDField()
    price_amount = serializers.IntegerField(min_value=0)
    is_verified = serializers.BooleanField(required=False, default=True)
    source_type = serializers.CharField(required=False, default="restaurant")

    def validate_variant_id(self, value):
        if not MenuItemVariant.objects.filter(id=value).exists():
            raise serializers.ValidationError("Variant topilmadi.")
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        variant = MenuItemVariant.objects.get(id=self.validated_data["variant_id"])
        restaurant = Restaurant.objects.filter(owner=user).first()

        if not restaurant:
            raise serializers.ValidationError({"detail": "Sizga restoran biriktirilmagan."})

        obj, created = MenuItemPrice.objects.update_or_create(
            restaurant=restaurant,
            variant=variant,
            defaults={
                "price_amount": self.validated_data["price_amount"],
                "is_verified": self.validated_data.get("is_verified", True),
                "source_type": self.validated_data.get("source_type", "restaurant"),
            },
        )
        return obj


class OwnerRestaurantPriceListSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source="restaurant.name", read_only=True)
    variant_label = serializers.CharField(source="variant.label", read_only=True)
    size_value = serializers.IntegerField(source="variant.size_value", read_only=True)
    size_unit = serializers.CharField(source="variant.size_unit", read_only=True)
    item_id = serializers.UUIDField(source="variant.item.id", read_only=True)
    item_name = serializers.CharField(source="variant.item.name", read_only=True)
    category_name = serializers.CharField(source="variant.item.category.name", read_only=True)

    class Meta:
        model = MenuItemPrice
        fields = [
            "id",
            "restaurant_name",
            "variant_label",
            "size_value",
            "size_unit",
            "item_id",
            "item_name",
            "category_name",
            "price_amount",
            "is_verified",
            "source_type",
            "created_at",
            "updated_at",
        ]