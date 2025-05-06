from sympy import GF, Poly, isprime, div
from sympy.abc import x
import random


# COMPUTE PRIME POWERS UP TO N
N = 50
primes = [i for i in range(N) if isprime(i)]
prime_powers = dict()
for p in primes:
    for n in range(1, N):
        if p ** n > N:
            break
        order = p ** n
        prime_powers[order] = (p, n)

# DEFINE CLASS FOR ARITHMETIC IN A FINITE FIELD
class FiniteField:
    """Defines addition and multiplication of elements in the finite field of order p^n,
    where p is a prime number and n is a positive integer. The field is represented as

    F_{p^n} := F_{p}[x]/<f(x)>,

    where f(x) is a degree n (monic) irreducible polynomial over F_p.
    Let r be any root of f, so f(r)=0. Then any element of the field F_{p^n} can be
    uniquely represented by the polynomial

    a_0 + a_1 r + a_2 r^2 + ... + a_{n-1} r^{n-1},

    which makes addition and multiplication behave the way they should. That same
    element can also be represented as a single integer in [0, p^n - 1]:

    a_0 + a_1 p + a_2 p^2 + ... + a_{n-1} p^{n-1}.

    That integer representation does not make addition and multiplication work the way
    they should, but it is more convenient and human-readable."""

    # TODO: check that the time complexity for creating a projective plane of
    # order q is O(q^2)
    def __init__(self, q):
        assert q in prime_powers, f"q must be a prime number below {N}, not {q}"
        self.p, self.n = prime_powers[q]
        self.field_order = q
        self.base_field = GF(p)
        self.modulus = self._find_irreducible_poly()
        self.cached_add  = dict()
        self.cached_mult = dict()
        self.cached_inv  = dict()
        self.cached_neg  = dict()

    def _int_to_poly(self, num):
        """Convert an integer to a polynomial with coefficients in F_p"""
        coeffs = []
        for _ in range(self.n):
            coeffs.append(num % self.p)
            num //= self.p
        return Poly(reversed(coeffs), x, modulus = self.p)

    def _poly_to_int(self, poly):
        """Convert a polynomial to an integer using base p encoding"""
        coeffs = poly.all_coeffs()
        return sum((c % self.p) * (self.p ** i) for i, c in enumerate(reversed(coeffs)))

    def _find_irreducible_poly(self):
        """Amortized time complexity is not bad.
        According to ChatGPT, the number of monic, irreducible polynomials of degree n over F_p is

        N(p, n) :=  \sum_{d|n} \mu(d) \cdot p^{n/d} / n,

        where \mu is the Möbius function. The dominant term in that sum is \mu(1)p^{n/1}=p^n, and
        since the total number of monic polynomials of degree n over F_p is p^n, the probability that a
        randomly selected monic polynomial of degree n over F_p will be irreducible is roughly 1/n"""
        while True:
            # Generate random monic polynomial
            coeffs = [1] + [random.randint(0, self.p - 1) for _ in range(self.n)]
            poly = Poly(coeffs, x, modulus = self.p)
            # Return it if it's irreducible, otherwise keep guessing
            if poly.is_irreducible:
                return poly

    def add(self, a, b):
        """Add two field elements (given as integers)"""
        assert 0 <= a < self.field_order and 0 <= b < self.field_order, "Element out of range"
        if (a, b) in self.cached_add:
            return self.cached_add[(a, b)]
        poly_a = self._int_to_poly(a)
        poly_b = self._int_to_poly(b)
        poly_sum = div(poly_a + poly_b, self.modulus)[1]
        a_plus_b = self._poly_to_int(poly_sum)
        self.cached_add[(a, b)] = a_plus_b
        self.cached_add[(b, a)] = a_plus_b
        return a_plus_b

    def mult(self, a, b):
        """Multiply two field elements (given as integers)"""
        assert 0 <= a < self.field_order and 0 <= b < self.field_order, "Element out of range"
        if (a, b) in self.cached_mult:
            return self.cached_mult[(a, b)]
        poly_a = self._int_to_poly(a)
        poly_b = self._int_to_poly(b)
        product = div(poly_a * poly_b, self.modulus)[1]
        a_times_b = self._poly_to_int(product)
        self.cached_mult[(a, b)] = a_times_b
        self.cached_mult[(b, a)] = a_times_b
        return a_times_b

    def inv(self, a):
        """Returns multiplicative inverse of a"""
        assert 0 < a < self.field_order, "Element out of range"
        if a in self.cached_inv:
            return self.cached_inv[a]
        for i in range(self.field_order):
            if self.mult(a, i) == 1:
                self.cached_inv[a] = i
                self.cached_inv[i] = a
                return i
        raise Exception(f"Unable to calculate multiplicative inverse of {a}")

    def neg(self, a):
        """Returns additive inverse of a"""
        assert 0 <= a < self.field_order, "Element out of range"
        if a in self.cached_neg:
            return self.cached_neg[a]
        for i in range(self.field_order):
            if self.add(a, i) == 0:
                self.cached_neg[a] = i
                self.cached_neg[i] = a
                return i
        raise Exception(f"Unable to calculate additive inverse of {a}")

    def div(self, a, b):
        return self.mult(a, self.inv(b))


# DEFINE PROJECTIVE PLANE IN TERMS OF PRIME FIELD
class ProjectivePlane:
    def __init__(self, q):
        """Generates the projective plane consisting of:
        q^2+q+1 lines, which each contain q+1 points, and
        q^2+q+1 points, which are each contained in q+1 different lines.
        Points are labeled as integers in [0, q^2+q], and lines are
        represented as sets of those integers. Initializing this takes O(q^3)
        time, because there are O(q^2) cards with O(q) symbols each."""
        self.q = q
        self.num_lines = q**2 + q + 1
        F = FiniteField(q)
        # Each triple can either represent a point with coordinates (x, y, z) or
        # a line with the equation ax+by+cz=0 and coefficients (a, b, c). In
        # either case, we can assume WLOG that the first non-zero entry is 1.
        self.triples = {(0, 0, 1)}
        for i in range(q):
            self.triples.add((0, 1, i))
            for j in range(q):
                self.triples.add((1, i, j))
        # self.lines is a dictionary from lines (a, b, c) to the set of
        # points (x, y, z) included in that line
        self.lines = dict()
        for line in self.triples:
            a, b, c = line
            if a == 1:
                # If a=1, then the equation ax+by+cz=0 becomes x+by+cz=0, and we
                # can assume WLOG that x=1, so it becomes 1+by+cz=0. One solution is
                # (0, 1, -b/c), unless c=0, in which case (0, 0, 1) is a solution.
                if c == 0:
                    self.lines[line] = {(0, 0, 1)}
                else:
                    self.lines[line] = {(0, 1, F.neg(F.div(b, c)))}
                # The remaining solutions can be parameterized by y to obtain
                # (1, y, -(1+by)/c), unless c=0. If c=0 and b is nonzero, the
                # remaining solutions can be parameterized by z as (1, -1/b, z),
                # but if b=c=0, they are parameterized by y as (0, 1, z)
                if c == 0 and b == 0:
                    for z in range(q):
                        self.lines[line].add((0, 1, z))
                elif c == 0:
                    for z in range(q):
                        self.lines[line].add((1, F.neg(F.inv(b)), z))
                else:
                    for y in range(q):
                        self.lines[line].add((1, y, F.neg(F.div(F.add(1, F.mult(b, y)), c))))
            elif b == 1:
                # If a=0 and b=1, then equation becomes y+cz=0, and since y is the
                # first non-zero coordinate, we can choose the representative
                # element with y=1. Then the line contains the point
                # (0, 1, -1/c), unless c=0, in which case it contains (0, 0, 1)
                if c == 0:
                    self.lines[line] = {(0, 0, 1)}
                else:
                    self.lines[line] = {(0, 1, F.neg(F.inv(c)))}
                # For the remaining solutions, assume x=1, so the equation is
                # y+cz=0. The remaining solutions can be parameterized by y,
                # so they have the form (1, y, -y/c), unless c=0, in which case
                # they have the form (1, 0, z)
                if c == 0:
                    for z in range(q):
                        self.lines[line].add((1, 0, z))
                else:
                    for y in range(q):
                        self.lines[line].add((1, y, F.neg(F.div(y, c))))
            else:
                assert c != 0
                # In this case, a=b=0, so the equation ax+by+cz=0 becomes
                # cz=0. Therefore z=0, but x and y can be anything. Since we
                # only include the representative element where the first
                # nonzero coordinate is 1, either x=1 and y can be anything,
                # or x=0 and y=1.
                self.lines[line] = {(1, y, 0) for y in range(q)}
                self.lines[line].add((0, 1, 0))

    def create_cards(self, symbols=[]):
        symbols = list(symbols)
        while len(symbols) < self.num_lines:
            symbols += [str(len(symbols) + 1)]
        enumerated_lines = {triple: value for value, triple in enumerate(self.lines)}
        cards = []
        for l in enumerated_lines.keys():
            cards.append({symbols[enumerated_lines[point]] for point in self.lines[l]})
        return cards
