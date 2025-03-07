import sys
import os
from fastapi.testclient import TestClient
import pytest
from httpx import AsyncClient, ASGITransport


# Dynamically add the parent directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app  # Import your FastAPI app

client = TestClient(app)


def test_search_payments_success():
    # Test case for a successful request
    payload = {
        "vat": "998477820",
        "sapNumber": "5000001494",
        "year": 2024,
        "entalma": ""
    }
    response = client.post("/search_payments/", json=payload)
    assert response.status_code == 200  # Check HTTP status
    data = response.json()
    assert data["status"] == "success"  # Ensure success status
    assert len(data["data"]) > 0  # Ensure data exists


def test_search_payments_not_found():
    # Test case for no results found
    payload = {
        "vat": "123456789",
        "sapNumber": "9999999999",
        "year": 2024,
        "entalma": ""
    }
    response = client.post("/search_payments/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_found"
    assert "message" in data  # Ensure error message is present


def test_search_payments_missing_field():
    # Test case for missing required fields
    payload = {
        "sapNumber": "5000001494",
        "year": 2024
    }
    response = client.post("/search_payments/", json=payload)
    assert response.status_code == 422  # Check for Unprocessable Entity

def test_missing_fields():
    payload = {"vat": "998477820", "sapNumber": "5000001494"}  # Missing year
    response = client.post("/search_payments/", json=payload)
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_search_payments_async():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "vat": "998477820",
            "sapNumber": "5000001494",
            "year": 2024,
            "entalma": ""
        }
        response = await client.post("/search_payments/", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
