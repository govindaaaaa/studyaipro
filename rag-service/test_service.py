#!/usr/bin/env python3
"""
Simple test script for RAG microservice
Run this after starting the service to verify it works
"""

import requests
import sys

BASE_URL = "http://localhost:8001"

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        response.raise_for_status()
        print(f"✓ Health check passed: {response.json()}")
        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False

def test_add_chunks():
    """Test adding chunks"""
    print("\nTesting /add-chunks endpoint...")
    try:
        data = {
            "session_id": "test-session-123",
            "chunks": [
                "Python is a high-level programming language.",
                "FastAPI is a modern web framework for Python.",
                "FAISS is a library for similarity search."
            ]
        }
        response = requests.post(f"{BASE_URL}/add-chunks", json=data)
        response.raise_for_status()
        print(f"✓ Add chunks passed: {response.json()}")
        return True
    except Exception as e:
        print(f"✗ Add chunks failed: {e}")
        return False

def test_retrieve():
    """Test retrieving chunks"""
    print("\nTesting /retrieve endpoint...")
    try:
        data = {
            "session_id": "test-session-123",
            "query": "What is Python?",
            "k": 2
        }
        response = requests.post(f"{BASE_URL}/retrieve", json=data)
        response.raise_for_status()
        result = response.json()
        print(f"✓ Retrieve passed: Found {result['count']} chunks")
        print(f"  Chunks: {result['chunks']}")
        return True
    except Exception as e:
        print(f"✗ Retrieve failed: {e}")
        return False

def test_get_all():
    """Test getting all chunks"""
    print("\nTesting /chunks/{session_id} endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/chunks/test-session-123")
        response.raise_for_status()
        result = response.json()
        print(f"✓ Get all chunks passed: {result['count']} chunks")
        return True
    except Exception as e:
        print(f"✗ Get all chunks failed: {e}")
        return False

def test_delete():
    """Test deleting session"""
    print("\nTesting DELETE /chunks/{session_id} endpoint...")
    try:
        response = requests.delete(f"{BASE_URL}/chunks/test-session-123")
        response.raise_for_status()
        print(f"✓ Delete session passed: {response.json()}")
        return True
    except Exception as e:
        print(f"✗ Delete session failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("RAG Microservice Test Suite")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("Add Chunks", test_add_chunks),
        ("Retrieve Chunks", test_retrieve),
        ("Get All Chunks", test_get_all),
        ("Delete Session", test_delete)
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        if test_func():
            passed += 1
        else:
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 50)
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
