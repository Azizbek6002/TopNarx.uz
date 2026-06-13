from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def health_check(request):
    return JsonResponse({"status": "ok", "database": "connected"})

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/", include("places.urls")),
    path("api/", include("pricing.urls")),
    path("api/", include("menu.urls")),
    path("api/", include("users.urls")),

    path('api/auth/', include('users.urls')),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path('api/menu/', include('menu.urls')),

    path('health/', health_check, name='health_check'),
]