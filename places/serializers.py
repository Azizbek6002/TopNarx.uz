from rest_framework import serializers
from .models import Restaurant, Tag
from rest_framework import serializers
from .models import Restaurant

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


class RestaurantSerializer(serializers.ModelSerializer):
    owner_id = serializers.UUIDField(source="owner.id", read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "slug",
            "phone",
            "address_text",
            "lat",
            "lng",
            "is_active",
            "owner_id",
        ]

class RestaurantRecommendSerializer(serializers.ModelSerializer):
    recommend_score = serializers.FloatField(read_only=True)

    class Meta:
        model = Restaurant
        fields = ["id", "name", "slug", "address_text", "lat", "lng", "recommend_score"]


class OwnerRestaurantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            "name",
            "slug",
            "phone",
            "address_text",
            "lat",
            "lng",
        ]

    def validate_slug(self, value):
        qs = Restaurant.objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Bu slug allaqachon mavjud.")
        return value