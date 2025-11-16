package main

import (
    "os"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

// jwtSecret returns the signing secret from env or a default fallback.
func jwtSecret() []byte {
    if v := os.Getenv("JWT_SECRET"); v != "" {
        return []byte(v)
    }
    return []byte("dev-secret")
}

// CreateToken creates a JWT token for the given user with a 24h expiry.
func CreateToken(u *User) (string, error) {
    claims := jwt.MapClaims{
        "sub":  u.NationalID,
        "name": u.FirstName + " " + u.LastName,
        "iat":  time.Now().Unix(),
        "exp":  time.Now().Add(24 * time.Hour).Unix(),
        "uid":  u.ID,
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret())
}
