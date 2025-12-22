from rest_framework.filters import SearchFilter

class QueryParamSearchFilter(SearchFilter):
    """
    DRF SearchFilter, but standardize on ?q= instead of ?search=.
    """
    search_param = "q"

def parse_bool(val):
    """
    Parse common boolean query param values.
    Returns True/False, or None if value is missing/invalid.
    """
    if val is None:
        return None
    v = str(val).strip().lower()
    if v in ("1", "true", "t", "yes", "y", "on"):
        return True
    if v in ("0", "false", "f", "no", "n", "off"):
        return False
    return None


def is_truthy(val) -> bool:
    """
    Convenience for "is explicitly true" checks.
    """
    return parse_bool(val) is True