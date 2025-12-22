# backend/makerfex_backend/mixins.py
"""
Reusable backend mixins for canonical server-driven tables and tenant scoping.

These are opt-in guardrails:
- ServerTableViewSetMixin: ensures ?q= search + ?ordering= sorting are always available
  without clobbering any existing filter_backends.
- ShopScopedQuerysetMixin: ensures tenant safety by scoping all queries to the current
  user's shop via get_shop_for_user(request.user), returning an empty queryset if no
  shop is resolved.

No UI changes. No new query params. No behavior changes unless a viewset opts in.
"""

from __future__ import annotations

from rest_framework.filters import OrderingFilter

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter


class ServerTableViewSetMixin:
  """
  Opt-in mixin to enforce the canonical server-driven table contract:

  - ?q= free-text search via QueryParamSearchFilter
  - ?ordering= sorting via DRF OrderingFilter
  - pagination handled via DRF settings (page/page_size)

  This mixin is append-only with respect to filter_backends: it will preserve any
  filter backends already configured on the viewset and add required ones if missing.

  Usage:

    class CustomerViewSet(ServerTableViewSetMixin, viewsets.ModelViewSet):
      filter_backends = [DjangoFilterBackend]  # kept
      search_fields = ["name", "email"]
      ordering_fields = ["id", "name", "created_at"]
      ordering = ("name", "id")
  """

  # Stable default ordering; override in subclasses when needed.
  ordering = ("-id",)

  # Required filter backends for the canonical contract.
  required_filter_backends = (QueryParamSearchFilter, OrderingFilter)

  def get_filter_backends(self):
    """
    Return effective filter backends for this view.

    DRF normally reads `self.filter_backends` directly; we centralize combination logic
    here and use it in filter_queryset() so we can guarantee required backends exist
    without mutating the class attribute.
    """
    backends = list(getattr(self, "filter_backends", []) or [])
    for required in self.required_filter_backends:
      if required not in backends:
        backends.append(required)
    return backends

  def filter_queryset(self, queryset):
    """
    Apply filter backends using the combined list from get_filter_backends().

    This mirrors DRF's GenericAPIView.filter_queryset behavior, but ensures our
    required backends are always included when this mixin is used.
    """
    for backend_cls in self.get_filter_backends():
      queryset = backend_cls().filter_queryset(self.request, queryset, self)
    return queryset


class ShopScopedQuerysetMixin:
  """
  Opt-in mixin to enforce tenant safety for shop-owned objects.

  Subclasses must implement get_shop_queryset(shop) and return a queryset scoped
  to the provided shop.

  Usage:

    class ProjectViewSet(ShopScopedQuerysetMixin, viewsets.ModelViewSet):
      def get_shop_queryset(self, shop):
        return Project.objects.filter(shop=shop)

  If no shop is resolved for the current user, this mixin returns an empty queryset.
  """

  def get_shop(self):
    return get_shop_for_user(self.request.user)

  def get_shop_queryset(self, shop):
    raise NotImplementedError("Implement get_shop_queryset(shop)")

  def get_queryset(self):
    shop = self.get_shop()
    if not shop:
      # Fail closed: never leak data cross-tenant.
      base = getattr(self, "queryset", None)
      if base is not None:
        return base.none()
      raise AssertionError(
        "ShopScopedQuerysetMixin requires either a queryset attribute or an overridden get_queryset()."
      )
    return self.get_shop_queryset(shop)
