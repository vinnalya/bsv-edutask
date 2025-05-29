import pytest 
from unittest import mock
from src.controllers.usercontroller import UserController
import logging

@pytest.fixture
def mock_dao():
    return mock.MagicMock()

@pytest.fixture
def system_under_test(mock_dao):
    return UserController(dao=mock_dao)

@pytest.fixture(autouse=True)
def mock_logger():
    with mock.patch.object(logging, 'warning') as mock_logging:
        yield mock_logging


#test for email and user
@pytest.mark.unit
def test_user(system_under_test, mock_dao):
    email = "ferdiie@gmail.com"
    mock_dao.find.return_value = [{"id": 1, "email": email}]
    result = system_under_test.get_user_by_email(email)
    assert result == {"id": 1, "email": email}



#valid email
@pytest.mark.unit
def test_user_notFound(system_under_test, mock_dao):
    email = "bella@hotmail.com"
    mock_dao.find.return_value = []
    result = system_under_test.get_user_by_email(email)
    assert result is None


#multiple users
@pytest.mark.unit
def test_multiple_users(system_under_test, mock_dao, mock_logger):
    email = "bellaAndFerdiie@gmail.com"
    mock_dao.find.return_value = [
        {"id": 1, "email": email},
        {"id": 2, "email": email}
    ]
    result = system_under_test.get_user_by_email(email)
    assert result == {"id": 1, "email": email}
    mock_logger.assert_called_once_with("Found more than one user with email %s", email)


#invaild email
@pytest.mark.unit
def test_invalid_email_format(system_under_test):
    with pytest.raises(ValueError, match="Invalid email address"):
        system_under_test.get_user_by_email("bella.com")


#empty string
@pytest.mark.unit
def test_empty_string(system_under_test):
    with pytest.raises(ValueError, match="Invalid email address"):
        system_under_test.get_user_by_email("")

#email whitespace
@pytest.mark.unit
def test_email_whitespace(system_under_test):
    with pytest.raises(ValueError, match="Invalid email address"):
        system_under_test.get_user_by_email(" ferdiie@gmail.com")

#db fail
@pytest.mark.unit
def test_database_error(system_under_test, mock_dao):
    mock_dao.find.side_effect = Exception("Database error")
    with pytest.raises(Exception, match="Database error"):
        system_under_test.get_user_by_email("problemDb@gmail.com")

#@ test
@pytest.mark.unit
def test_only_symbol(system_under_test):
    with pytest.raises(ValueError, match="Invalid email address"):
        system_under_test.get_user_by_email("@")

#minimum charecter
@pytest.mark.unit
def test_minimum_email(system_under_test, mock_dao):
    email = "fer@gmail.com"
    mock_dao.find.return_value = [{"id": 3, "email": email}]
    result = system_under_test.get_user_by_email(email)
    assert result == {"id": 3, "email": email}
