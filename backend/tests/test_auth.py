import pytest
from src.use_cases.auth_use_case import AuthUseCase

def test_validate_password_valid():
    assert AuthUseCase.validate_password("1a2b3c4d5e") is True

def test_validate_password_invalid_length():
    assert AuthUseCase.validate_password("1a2b") is False

def test_validate_password_invalid_hex():
    assert AuthUseCase.validate_password("helloworld") is False

def test_hash_password():
    plain = "a1b2c3d4"
    hashed = AuthUseCase.hash_password(plain)
    assert hashed != plain
    assert len(hashed) > 10

def test_verify_password():
    plain = "f1e2d3c4"
    hashed = AuthUseCase.hash_password(plain)
    assert AuthUseCase.verify_password(plain, hashed) is True
    assert AuthUseCase.verify_password("1a2b3c4d", hashed) is False
