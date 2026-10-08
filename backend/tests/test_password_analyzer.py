from app.services.password_analyzer import evaluate_password_strength, calculate_shannon_entropy

def test_entropy_calculation():
    assert calculate_shannon_entropy("aaaaa") == 0.0
    assert calculate_shannon_entropy("abcde") > 2.0

def test_weak_password_evaluation():
    res = evaluate_password_strength("123456")
    assert res["status"] in ["Very Weak", "Weak"]
    assert res["score"] < 30
    assert res["checks"]["is_not_common"] == False

def test_strong_password_evaluation():
    res = evaluate_password_strength("K9#mX2$vL8!pQ5zW")
    assert res["status"] in ["Strong", "Very Strong"]
    assert res["score"] > 80
    assert res["checks"]["has_uppercase"] == True
    assert res["checks"]["has_symbol"] == True
