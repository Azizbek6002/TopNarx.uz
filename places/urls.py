from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OwnerMyRestaurantView


from .views import (
    RestaurantViewSet,
    TagViewSet,
    NearbyRestaurantsView,
    NearbyRecommendView,
)

router = DefaultRouter()
router.register(r"restaurants", RestaurantViewSet, basename="restaurant")
router.register(r"tags", TagViewSet, basename="tag")

urlpatterns = [
    # CRUD routerlar
    path("", include(router.urls)),

    # GEO endpoints
    path("nearby/restaurants/", NearbyRestaurantsView.as_view(), name="nearby-restaurants"),
    path("nearby/recommend/", NearbyRecommendView.as_view(), name="nearby-recommend"),

    path("owner/me/restaurant/", OwnerMyRestaurantView.as_view(), name="owner-my-restaurant"),
]
