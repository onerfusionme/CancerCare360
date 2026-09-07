import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.guardrails import verify_safety, apply_guardrails, DISCLAIMER

class TestClinicalSafetyGuardrails(unittest.TestCase):

    def test_safe_observational_text(self):
        safe_text = "The laboratory panel indicates elevated leukocytes and erythrocyte sedimentation rate."
        is_safe, violations = verify_safety(safe_text)
        self.assertTrue(is_safe)
        self.assertEqual(len(violations), 0)

    def test_blocks_autonomous_diagnosis(self):
        unsafe_text = "Analysis concludes patient has carcinoma of the left breast."
        is_safe, violations = verify_safety(unsafe_text)
        self.assertFalse(is_safe)
        self.assertTrue(any("carcinoma" in v for v in violations))

    def test_blocks_autonomous_prescription(self):
        unsafe_text = "Recommendation: administer cisplatin 75 mg intravenously."
        is_safe, violations = verify_safety(unsafe_text)
        self.assertFalse(is_safe)
        self.assertTrue(any("administer" in v for v in violations))

    def test_blocks_autonomous_prognostication(self):
        unsafe_text = "Estimated patient prognosis is 6 months."
        is_safe, violations = verify_safety(unsafe_text)
        self.assertFalse(is_safe)

    def test_apply_guardrails_appends_mandatory_disclaimer(self):
        safe_text = "Routine post-operative wound healing observed."
        guarded = apply_guardrails(safe_text)
        self.assertIn(DISCLAIMER, guarded)

    def test_apply_guardrails_raises_exception_on_violation(self):
        unsafe_text = "Based on imaging, patient has tumor in the lung."
        with self.assertRaises(ValueError):
            apply_guardrails(unsafe_text)

if __name__ == '__main__':
    unittest.main()
