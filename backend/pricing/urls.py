from django.urls import path
from .views import (
    ComparePriceView, CompareByItemView,
    PriceSubmissionCreateView, MySubmissionsView, NearbyCompareView,
    AdminPendingSubmissionsView, ApproveSubmissionView, RejectSubmissionView, FavoriteListCreateView,
    FavoriteDeleteView,
    OwnerPriceUpsertView, OwnerMyPricesView,
)

urlpatterns = [
    path("compare/", ComparePriceView.as_view()),
    path("compare2/", CompareByItemView.as_view()),

    path("submissions/", PriceSubmissionCreateView.as_view()),
    path("submissions/my/", MySubmissionsView.as_view()),

    path("admin/submissions/", AdminPendingSubmissionsView.as_view()),
    path("admin/submissions/<uuid:submission_id>/approve/", ApproveSubmissionView.as_view()),
    path("admin/submissions/<uuid:submission_id>/reject/", RejectSubmissionView.as_view()),

    path("nearby/compare/", NearbyCompareView.as_view()),

    path("favorites/", FavoriteListCreateView.as_view()),
    path("favorites/<uuid:variant_id>/", FavoriteDeleteView.as_view()),

    path("owner/prices/upsert/", OwnerPriceUpsertView.as_view(), name="owner-price-upsert"),
    path("owner/prices/", OwnerMyPricesView.as_view(), name="owner-my-prices"),

]
