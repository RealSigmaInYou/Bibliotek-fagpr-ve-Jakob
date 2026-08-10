from auth import hash_password

admin_hash = hash_password("admin")
print(admin_hash)

saksbehandler_hash = hash_password("haimat")
print(saksbehandler_hash)

