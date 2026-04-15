import requests
import sys
import json
from datetime import datetime

class SyncTechAPITester:
    def __init__(self, base_url="https://synctech-flowops.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test basic API connectivity"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_agent_reasoning(self):
        """Test LLM agent reasoning endpoint"""
        test_data = {
            "agent_type": "demand",
            "context": "Order surge detected in Zone A with 47% increase over last 90 seconds"
        }
        success, response = self.run_test(
            "Agent Reasoning (Demand)", 
            "POST", 
            "agent-reasoning", 
            200, 
            test_data
        )
        
        if success and response:
            # Validate response structure
            if 'reasoning' in response and 'agent_type' in response:
                print(f"   ✅ Valid response structure")
                print(f"   Agent Type: {response['agent_type']}")
                print(f"   Reasoning: {response['reasoning'][:100]}...")
                return True
            else:
                print(f"   ❌ Invalid response structure")
                return False
        return success

    def test_agent_reasoning_routing(self):
        """Test routing agent reasoning"""
        test_data = {
            "agent_type": "routing",
            "context": "Agent Rajan's ETA exceeded threshold by 4.2min in Zone A"
        }
        return self.run_test(
            "Agent Reasoning (Routing)", 
            "POST", 
            "agent-reasoning", 
            200, 
            test_data
        )

    def test_agent_reasoning_recovery(self):
        """Test recovery agent reasoning"""
        test_data = {
            "agent_type": "recovery",
            "context": "Cascade failure detected with ORD-1203 delay propagating to 3 downstream orders"
        }
        return self.run_test(
            "Agent Reasoning (Recovery)", 
            "POST", 
            "agent-reasoning", 
            200, 
            test_data
        )

    def test_agent_reasoning_inventory(self):
        """Test inventory agent reasoning"""
        test_data = {
            "agent_type": "inventory",
            "context": "Store Gamma dairy stock at 18% - below critical threshold"
        }
        return self.run_test(
            "Agent Reasoning (Inventory)", 
            "POST", 
            "agent-reasoning", 
            200, 
            test_data
        )

    def test_cascade_reasoning(self):
        """Test cascade reasoning endpoint"""
        test_data = {
            "trigger_order": "ORD-1847",
            "affected_orders": ["ORD-1848", "ORD-1849", "ORD-1850"],
            "zone": "Zone A",
            "context": "Multiple order delays detected within 10 second window"
        }
        success, response = self.run_test(
            "Cascade Reasoning", 
            "POST", 
            "cascade-reasoning", 
            200, 
            test_data
        )
        
        if success and response:
            # Validate response structure
            required_fields = ['reasoning', 'trigger_order', 'affected_orders']
            if all(field in response for field in required_fields):
                print(f"   ✅ Valid cascade response structure")
                print(f"   Trigger Order: {response['trigger_order']}")
                print(f"   Affected Orders: {response['affected_orders']}")
                print(f"   Reasoning: {response['reasoning'][:100]}...")
                return True
            else:
                print(f"   ❌ Invalid cascade response structure")
                return False
        return success

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test POST status
        test_data = {"client_name": "test_client"}
        success1, _ = self.run_test("Create Status Check", "POST", "status", 200, test_data)
        
        # Test GET status
        success2, _ = self.run_test("Get Status Checks", "GET", "status", 200)
        
        return success1 and success2

def main():
    print("🚀 Starting SyncTech FlowOps Backend API Testing")
    print("=" * 60)
    
    tester = SyncTechAPITester()
    
    # Test basic connectivity
    tester.test_root_endpoint()
    
    # Test status endpoints
    tester.test_status_endpoints()
    
    # Test new LLM agent reasoning endpoints
    tester.test_agent_reasoning()
    tester.test_agent_reasoning_routing()
    tester.test_agent_reasoning_recovery()
    tester.test_agent_reasoning_inventory()
    
    # Test cascade reasoning endpoint
    tester.test_cascade_reasoning()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Backend API Test Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("✅ All backend API tests passed!")
        return 0
    else:
        print("❌ Some backend API tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())