import re

def validate_email(email: str) -> tuple[bool, str]:
    """
    Valida el formato de un email (aproximación RFC 5322).
    """
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if re.fullmatch(pattern, email):
        return True, ""
    return False, "Invalid email format"

def generate_password_error_message(password: str) -> str:
    """
    Retorna el mensaje de error específico para una contraseña inválida.
    """
    if len(password) < 6:
        return "Password debe tener mínimo 6 caracteres"
    if not re.fullmatch(r"[0-9a-fA-F]+", password):
        return "Password debe ser solo hexadecimal"
    return ""

def validate_password(password: str) -> tuple[bool, str]:
    """
    Valida que la contraseña tenga mínimo 6 caracteres y sea solo hexadecimal.
    """
    error = generate_password_error_message(password)
    if error:
        return (False, error)
    return (True, "")
