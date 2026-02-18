from .fatsecret_api import search_food, get_food_details
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://trackcalories.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/search")
def search(query: str):
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    raw_results = search_food(query)

    if not raw_results:
        return {"results": []}

    foods = []
    seen_foods = set()

    for food in raw_results:
        name_key = food["food_name"].lower()

        if name_key in seen_foods:
            continue

        seen_foods.add(name_key)

        foods.append({
            "food_id": food["food_id"],
            "food_name": food["food_name"]
        })

    return {"results": foods}

@app.get("/api/details")
def get_details(food_id: str, qty: float, unit: str):
    if qty <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    if unit not in ["serving", "grams"]:
        raise HTTPException(status_code=400, detail="Unit must be 'serving' or 'grams'")

    details = get_food_details(food_id)

    if not details:
        raise HTTPException(status_code=404, detail="Food not found")

    servings = details["servings"]["serving"]
    serving = servings[0] if isinstance(servings, list) else servings

    calories = float(serving.get("calories", 0))
    carbs = float(serving.get("carbohydrate", 0))
    protein = float(serving.get("protein", 0))
    fat = float(serving.get("fat", 0))

    multiplier = 1.0

    if unit == "serving":
        multiplier = qty
    else:
        grams_per_serving = float(serving.get("metric_serving_amount", 0))
        if grams_per_serving <= 0:
            raise HTTPException(status_code=400, detail="Gram data not available")
        multiplier = qty / grams_per_serving

    return {
        "food_name": details["food_name"],
        "quantity": qty,
        "unit": unit,
        "calories": round(calories * multiplier, 2),
        "carbs": round(carbs * multiplier, 2),
        "protein": round(protein * multiplier, 2),
        "fat": round(fat * multiplier, 2),
    }
