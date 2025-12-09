from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .search import GlobalSearchView

urlpatterns = [
    path("admin/", admin.site.urls),

    # API schema & docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="api-docs",
    ),

    # Domain APIs (we'll add per-app urls later)
    path("api/search/", GlobalSearchView.as_view(), name="global-search"),
    path("api/accounts/", include("accounts.urls")),
    path("api/customers/", include("customers.urls")),
    path("api/workflows/", include("workflows.urls")),
    path("api/projects/", include("projects.urls")),
    path("api/tasks/", include("tasks.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/products/", include("products.urls")),
    path("api/sales/", include("sales.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/assistants/", include("assistants.urls")),
    path("api/config/", include("config.urls")),
]
