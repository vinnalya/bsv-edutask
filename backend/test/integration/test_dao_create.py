import pytest
from pymongo.errors import WriteError

def test_create_valid_data(dao_test_client):
    """
    It will test the create function.
    Expected result:Data succesfully added.
    """
    data = {
        "email": "test@gmail.com",
        "isActive": True
    }
    result = dao_test_client.create(data)
    assert result["email"] == "test@gmail.com"
    assert result["isActive"] is True





def test_create_missing_required_field(dao_test_client):
    """
    The email field sends missing data. 
    Therefore a Validator error is recevied.
    """
    data = {
        "isActive": True
    }
    with pytest.raises(WriteError):
        dao_test_client.create(data)




def test_create_invalid_email_type(dao_test_client):
    """
    email field returns int instead of string
    Gets validator error
    """
    data = {
        "email": 1234,
        "isActive": True
    }
    with pytest.raises(WriteError):
        dao_test_client.create(data)




def test_create_empty_email(dao_test_client):
    """
    email field receives empty string
    And gets validator error
    """
    data = {
        "email": "",
        "isActive": True
    }
    with pytest.raises(WriteError):
        dao_test_client.create(data)




def test_create_duplicate_email(dao_test_client):
    """
    Attemps are made twice with the same email
    The second operation fails
    """
    data = {
        "email": "duplicate@example.com",
        "isActive": True
    }
    dao_test_client.create(data)  # First one.
    with pytest.raises(WriteError):
        dao_test_client.create(data)  # Second one


def test_create_with_additional_field(dao_test_client):
    """
    An extra field that the validator does not normally recognize
    MongoDB will accept this additional field if the validator is not too strict,
    otherwise it will give an error
    """
    data = {
        "email": "extra@example.com",
        "isActive": True,
        "age": 19  # an extra field
    }
    try:
        result = dao_test_client.create(data)
        assert result["email"] == "extra@example.com"
    except WriteError:
        pass




def test_create_all_fields_none(dao_test_client):
    """
    All fields get None
    The result will fail
    """
    data = {
        "email": None,
        "isActive": None
    }
    with pytest.raises(WriteError):
        dao_test_client.create(data)






def test_create_very_long_email(dao_test_client):
    """
    A long string is sent
    If there is a validator limit, it will fail
    """
    data = {
        "email": "a" * 5000 + "@example.com",
        "isActive": True
    }
    with pytest.raises(WriteError):
        dao_test_client.create(data)






def test_create_valid_boolean_field(dao_test_client):
    """
    When we sand a vaild data to DAO's function, it checks if it works properly.
    As a result, the create function works without error.
    """
    data = {
        "email": "boolean@example.com",
        "isActive": False
    }
    result = dao_test_client.create(data)
    assert result["email"] == "boolean@example.com"
    assert result["isActive"] is False



def test_create_db_disconnected(monkeypatch, dao_test_client):
    """
    The create function is called when there is no database connection
    Expected result: Exception.
    """
    class FakeCollection:
        def insert_one(self, *args, **kwargs):
            raise Exception("No database connection")

    monkeypatch.setattr(dao_test_client, "collection", FakeCollection())

    data = {
        "email": "fail@example.com",
        "isActive": True
    }

    with pytest.raises(Exception):
        dao_test_client.create(data)
