from rest_framework.filters import SearchFilter

class QueryParamSearchFilter(SearchFilter):
    """
    DRF SearchFilter, but standardize on ?q= instead of ?search=.
    """
    search_param = "q"