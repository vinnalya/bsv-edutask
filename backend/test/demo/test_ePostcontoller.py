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

@pytest.mark.parametrize(
    "email, mock_return, expected_exception, expected_result, should_log_warning",
    [
        pytest.param("ferdiie@gmail.com", [{"id": 1, "email": "ferdiie@gmail.com"}], None, {"id": 1, "email": "ferdiie@gmail.com"}, False, id="valid_email_user_exists"),
        pytest.param("bella@hotmil.com", [], None, None, False, id="valid_email_user_not_found"),
        pytest.param("bellaAndFerdiie@gmail.com", [{"id": 1, "email": "bellaAndFerdiie@gmail.com"}, {"id": 2, "email": "bellaAndFerdiie@gmail.com"}], None, {"id": 1, "email": "bellaAndFerdiie@gmail.com"}, True, id="valid_email_multiple_users"),
        pytest.param("bella.com", None, ValueError, None, False, id="invalid_email_missing_at"),
        pytest.param("", None, ValueError, None, False, id="empty_email_string"),
        pytest.param(" ferdiie@gmail.com ", None, ValueError, None, False, id="email_with_whitespace"),
        pytest.param("problemDb@gmail.com", Exception("Database error"), Exception, None, False, id="valid_email_db_failure"),
        pytest.param("@", None, ValueError, None, False, id="only_at_in_email"),
        pytest.param("fer@gmail.com", [{"id": 3, "email": "fer@gmail.com"}], None, {"id": 3, "email": "fer@gmail.com"}, False, id="minimal_valid_email"),
    ]
)
def test_get_user_by_email(system_under_test, mock_dao, mock_logger, email, mock_return,
                         expected_exception, expected_result, should_log_warning):
    if isinstance(mock_return, Exception):
        mock_dao.find.side_effect = mock_return
    elif mock_return is not None:
        mock_dao.find.return_value = mock_return

    if expected_exception:
        with pytest.raises(expected_exception):
            system_under_test.get_user_by_email(email)
    else:
        result = system_under_test.get_user_by_email(email)
        assert result == expected_result
        mock_dao.find.assert_called_once_with({'email': email.strip()})

        if should_log_warning:
            mock_logger.assert_called_once_with("Found more than one user with email %s", email)
        else:
            mock_logger.assert_not_called()



def test_dao_called_with_trimmed_email(system_under_test, mock_dao):
    test_email = "  test@example.com  "
    mock_dao.find.return_value = []
    system_under_test.get_user_by_email(test_email)
    mock_dao.find.assert_called_once_with({'email': "test@example.com"})









def test_update_user_success(system_under_test, mock_dao):
    user_id = "abc123"
    update_data = {"name": "Updated Name"}
    expected_result = {"success": True}

    system_under_test.dao.update = mock.MagicMock(return_value=expected_result)

    result = system_under_test.update(user_id, update_data)

    system_under_test.dao.update.assert_called_once_with(id=user_id, data={'$set': update_data})
    assert result == expected_result




def test_update_user_failure(system_under_test, mock_dao):
    user_id = "abc123"
    update_data = {"name": "Error"}
    system_under_test.dao.update.side_effect = Exception("Update failed")

    with pytest.raises(Exception) as e:
        system_under_test.update(user_id, update_data)

    assert str(e.value) == "Update failed"
