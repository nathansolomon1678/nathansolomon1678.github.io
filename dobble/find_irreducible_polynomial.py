#!/usr/bin/env python3
from sympy import Poly, isprime
from sympy.abc import x

# COMPUTE PRIME POWERS UP TO N
N = 20
primes = [i for i in range(N) if isprime(i)]
prime_powers = dict()
for p in primes:
    for n in range(1, N):
        if p ** n > N:
            break
        order = p ** n
        prime_powers[order] = (p, n)

def int_to_poly(num, p, n):
    coeffs = []
    for _ in range(n):
        coeffs.append(num % p)
        num //= p
    return Poly(reversed(coeffs), x, modulus = p)

def mod(x, m):
    return (x % m + abs(m)) % m;

q_to_poly = dict()

print("IRREDUCIBLE MONIC POLYNOMIALS:")
for q in sorted(prime_powers.keys()):
    p, n = prime_powers[q]
    # Iterate through all monic polynomials (of degree n over Z_p)
    for num in range(p**n):
        poly = int_to_poly(num, p, n) + Poly(x**n, x, modulus = p)
        if poly.is_irreducible:
            print(poly)
            q_to_poly[q] = [mod(x, p) for x in reversed(poly.all_coeffs())]
            break

print("\n\nDictionary from q=p^n to a list of coefficients for an irreducible degree-n monic")
print("polynomial over Z_p, where coefficients are listed from lowest to highest order terms:\n{")
for q in q_to_poly.keys():
    print(f"{q:>5}: {q_to_poly[q]},")
print('}')
