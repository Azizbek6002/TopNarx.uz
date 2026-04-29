# menu/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"items", views.MenuItemViewSet, basename="menuitem")
router.register(r"variants", views.MenuItemVariantViewSet, basename="menuitemvariant")
router.register(r"categories", views.MenuCategoryViewSet, basename="menucategory")

urlpatterns = [
    path("search/variants/", views.VariantSearchView.as_view(), name="variant-search"),
    path("", include(router.urls)),
]