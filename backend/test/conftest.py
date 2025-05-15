import pytest
from src.util.dao import DAO
import os
import json

@pytest.fixture
def dao_test_client(monkeypatch): 
    """
    Create DAO object for test collection and delete it after testing.
    """
    collection_name = "test_collection"

    validator_path = os.path.join(
        os.path.dirname(__file__),
        "test_validators",
        f"{collection_name}.json"
    )

    print(f"Validator path: {validator_path}")
    
    if not os.path.exists(validator_path):
        raise FileNotFoundError(f"Validator JSON not found: {validator_path}")
    else:
        print("Validator JSON found.")

    def mock_get_validator(name):
        with open(validator_path, 'r') as file:
            validator = json.load(file)
        return validator


    monkeypatch.setattr("src.util.validators.getValidator", mock_get_validator)

    dao = DAO(collection_name)

    if hasattr(dao.collection, "delete_many"):
        dao.collection.delete_many({})
    yield dao

    if hasattr(dao.collection, "delete_many"):
        dao.collection.delete_many({})
