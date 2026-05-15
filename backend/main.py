import json
import sqlite3
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

app = FastAPI(title="Gyro Order API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = "orders.db"

VALID_GYRO_TYPES = {"classic", "chicken", "pork", "mixed", "veggie"}
VALID_SIDES = {"fries", "greek_salad", "rice", "extra_tzatziki", "pita"}


# ── Database ──────────────────────────────────────────────────────────────────

def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            gyro_type   TEXT NOT NULL,
            sides       TEXT NOT NULL,
            notes       TEXT,
            created_at  TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


init_db()


# ── Schemas ───────────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    name: str
    gyro_type: str
    sides: List[str]
    notes: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        if len(v) > 80:
            raise ValueError("Name too long")
        return v

    @field_validator("gyro_type")
    @classmethod
    def valid_gyro(cls, v: str) -> str:
        if v not in VALID_GYRO_TYPES:
            raise ValueError(f"gyro_type must be one of {sorted(VALID_GYRO_TYPES)}")
        return v

    @field_validator("sides")
    @classmethod
    def valid_sides(cls, v: List[str]) -> List[str]:
        invalid = set(v) - VALID_SIDES
        if invalid:
            raise ValueError(f"Invalid sides: {invalid}")
        return list(set(v))  # deduplicate

    @field_validator("notes")
    @classmethod
    def sanitise_notes(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            return v[:300] if v else None
        return None


class Order(BaseModel):
    id: str
    name: str
    gyro_type: str
    sides: List[str]
    notes: Optional[str]
    created_at: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/orders", response_model=Order, status_code=201)
def create_order(payload: OrderCreate):
    order_id = str(uuid.uuid4())[:8]
    created_at = datetime.utcnow().isoformat() + "Z"
    conn = get_db()
    conn.execute(
        "INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?)",
        (order_id, payload.name, payload.gyro_type,
         json.dumps(payload.sides), payload.notes, created_at),
    )
    conn.commit()
    conn.close()
    return Order(
        id=order_id,
        name=payload.name,
        gyro_type=payload.gyro_type,
        sides=payload.sides,
        notes=payload.notes,
        created_at=created_at,
    )


@app.get("/orders", response_model=List[Order])
def list_orders():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM orders ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [
        Order(
            id=r["id"],
            name=r["name"],
            gyro_type=r["gyro_type"],
            sides=json.loads(r["sides"]),
            notes=r["notes"],
            created_at=r["created_at"],
        )
        for r in rows
    ]


@app.delete("/orders/{order_id}", status_code=204)
def delete_order(order_id: str):
    conn = get_db()
    result = conn.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Order not found")


@app.delete("/orders", status_code=204)
def clear_orders():
    conn = get_db()
    conn.execute("DELETE FROM orders")
    conn.commit()
    conn.close()
