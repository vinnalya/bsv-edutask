import pytest
from src.util.dao import DAO
import json

@pytest.fixture
def dao_test_client():
    """
    Create DAO object for test collection and delete it after testing.
    """
    collection_name = "test_collection"
    dao = DAO(collection_name)
    dao.collection.create_index("email", unique=True)

    if hasattr(dao.collection, "delete_many"):
        dao.collection.delete_many({})

    yield dao

    if hasattr(dao.collection, "delete_many"):
        dao.collection.delete_many({})
