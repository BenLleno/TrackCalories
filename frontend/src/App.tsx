import React, { useState } from "react";

type Food = {
  food_id: string;
  food_name: string;
};

type Details = {
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("serving");
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(false);

  const [addedFoods, setAddedFoods] = useState<
    {
      food_name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      quantity: number;
      unit: string;
    }[]
  >([]);

  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const round = (num: number): number =>
    Math.round(num * 10) / 10;

  // search food
  const searchFood = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setDetails(null);
    setSelectedFood(null);

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/search?query=${query}`
    );
    const data = await response.json();

    setResults(data.results || []);
    setLoading(false);
  };

  // get details
  const getDetails = async () => {
    if (!selectedFood) return;

    setLoading(true);

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/details?food_id=${selectedFood.food_id}&qty=${qty}&unit=${unit}`
    );
    const data = await response.json();

    setDetails(data);
    setLoading(false);
  };

  //ADD FOOD
  const addFood = () => {
    if (!selectedFood || !details) return;

    setAddedFoods((prev) => {
      const updated = [
        ...prev,
        {
          food_name: selectedFood.food_name,
          quantity: details.quantity,
          unit: details.unit,
          calories: details.calories,
          protein: details.protein,
          carbs: details.carbs,
          fat: details.fat,
        },
      ];

      setTotals({
        calories: round(updated.reduce((s, f) => s + f.calories, 0)),
        protein: round(updated.reduce((s, f) => s + f.protein, 0)),
        carbs: round(updated.reduce((s, f) => s + f.carbs, 0)),
        fat: round(updated.reduce((s, f) => s + f.fat, 0)),
      });

      return updated;
    });
  };

  const deleteFood = (index: number) => {
    const foodToRemove = addedFoods[index];

    setTotals((prev) => ({
      calories: round(prev.calories - round(foodToRemove.calories)),
      protein: round(prev.protein - round(foodToRemove.protein)),
      carbs: round(prev.carbs - round(foodToRemove.carbs)),
      fat: round(prev.fat - round(foodToRemove.fat)),
    }));

    setAddedFoods((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-6 gap-6">

      {/* totals */}
      <div className="w-full max-w-xl mt-6 p-6 order-2 lg:order-1">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Macros for Today
        </h2>

        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-6 text-center mb-6 shadow-lg">
          <p className="uppercase text-sm tracking-wider opacity-90">
            Total Calories
          </p>
          <p className="text-4xl font-bold mt-2">
            {totals.calories.toFixed(0)} kcal
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MacroCard label="Carbs" value={totals.carbs} unit="g" color="bg-yellow-100 text-yellow-700" />
          <MacroCard label="Protein" value={totals.protein} unit="g" color="bg-blue-100 text-blue-700" />
          <MacroCard label="Fat" value={totals.fat} unit="g" color="bg-red-100 text-red-700" />
        </div>

        {/* daily log */}
        {addedFoods.length > 0 && (
          <div className="mt-6">
            {/* column grid */}
            <div className="hidden md:grid grid-cols-[1.5fr_2.5fr_1.5fr_1.5fr_1fr_1.2fr_1fr] gap-2 px-3 mb-2 text-sm font-semibold text-gray-500 uppercase">
              <span></span>
              <span className="font-bold">Food</span>
              <span>Quantity</span>
              <span>Calories</span>
              <span>Carbs</span>
              <span>Protein</span>
              <span>Fat</span>
            </div>

            <ul className="space-y-4 md:space-y-2">
              {addedFoods.map((food, index) => (

                <li
                  key={index}
                  className="bg-gray-50 p-4 md:p-1 rounded-lg items-center relative md:grid md:grid-cols-[1.5fr_2.5fr_1.5fr_1.5fr_1fr_1.2fr_1fr] md:gap-2"
                >
                  <button
                    onClick={() => deleteFood(index)}
                    className="absolute top-2 right-2 md:static md:ml-4 w-6 h-6 md:w-4 md:h-2 bg-red-100 text-red-500 md:bg-red-500 md:text-white rounded-full md:rounded-lg text-xs md:text-sm flex items-center justify-center hover:bg-red-200 md:hover:bg-red-600 transition-colors"
                  >✕</button>

                  {/* Mobile View Structure */}
                  <div className="md:hidden">
                    <div className="font-bold text-lg text-gray-800 mb-1">{food.food_name}</div>
                    <div className="text-sm text-gray-500 mb-2">
                      {food.quantity} {food.unit === "serving" ? "serving(s)" : food.unit}
                    </div>
                    <div className="flex gap-3 text-sm font-medium text-gray-600 bg-white p-2 rounded-md shadow-sm justify-between">
                      <span>{food.calories.toFixed(0)} kcal</span>
                      <span className="text-yellow-600">{food.carbs.toFixed(0)}g C</span>
                      <span className="text-blue-600">{food.protein.toFixed(0)}g P</span>
                      <span className="text-red-600">{food.fat.toFixed(0)}g F</span>
                    </div>
                  </div>

                  {/* Desktop View Structure */}
                  <span className="hidden md:block font-semibold truncate">{food.food_name}</span>
                  <span className="hidden md:block font-semibold">{food.quantity} {food.unit === "serving" ? "ser." : food.unit && food.unit === "grams" ? "g" : food.unit}</span>
                  <span className="hidden md:block">{food.calories.toFixed(0)}<span className="font-semibold"> kcal</span></span>
                  <span className="hidden md:block">{food.carbs.toFixed(0)}<span className="font-semibold"> g</span></span>
                  <span className="hidden md:block">{food.protein.toFixed(0)}<span className="font-semibold"> g</span></span>
                  <span className="hidden md:block">{food.fat.toFixed(0)}<span className="font-semibold"> g</span></span>

                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* main card */}
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-3xl p-6 md:p-10 order-1 lg:order-2">
        <div className="text-center mb-8">
          <h1 className="bg-gradient-to-r from-blue-500 to-green-400 text-4xl font-bold text-white py-4 rounded-xl shadow-lg">
            Gym Macros
          </h1>
          <p className="text-gray-500 mt-2">
            Track calories and macros instantly
          </p>
        </div>

        {/* search */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Search food"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchFood();
              }
            }}
            className="flex-1 px-5 py-3 border rounded-xl"
          />
          <button
            onClick={searchFood}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl"
          >
            Search
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-500 animate-pulse mb-4">
            Loading...
          </p>
        )}

        {/* results */}
        {results.length > 0 && (
          <ul className="space-y-3 max-h-60 overflow-y-auto">
            {results.map((food) => (
              <li
                key={food.food_id}
                onClick={() => {
                  setSelectedFood(food);
                  setResults([]);
                  setDetails(null);
                }}
                className="p-4 rounded-xl cursor-pointer border hover:bg-gray-50"
              >
                {food.food_name}
              </li>
            ))}
          </ul>
        )}

        {/* quantity */}
        {selectedFood && (
          <div className="bg-gray-50 p-6 rounded-2xl mt-6 border">
            <h3 className="font-semibold text-lg mb-4">
              {selectedFood.food_name}
            </h3>

            <div className="flex gap-4 items-center justify-center flex-wrap">
              <input
                type="number"
                min={0}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-28 px-4 py-2 border rounded-lg"
              />

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="serving">Serving</option>
                <option value="grams">Grams</option>
              </select>

              <button
                onClick={getDetails}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Calculate
              </button>

              <button
                onClick={addFood}
                disabled={!details}
                className={`px-6 py-1 rounded-xl font-medium ${details
                  ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Add to Daily Log
              </button>
            </div>
          </div>
        )}

        {/* details */}
        {details && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Nutrition Breakdown
            </h2>

            <p className="text-3xl font-bold mb-4">
              {details.calories} kcal
            </p>

            <div className="grid grid-cols-3 gap-4">
              <MacroCard label="Carbs" value={details.carbs} unit="g" color="bg-yellow-100 text-yellow-700" />
              <MacroCard label="Protein" value={details.protein} unit="g" color="bg-blue-100 text-blue-700" />
              <MacroCard label="Fat" value={details.fat} unit="g" color="bg-red-100 text-red-700" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type MacroCardProps = {
  label: string;
  value: number;
  unit: string;
  color: string;
};

function MacroCard({ label, value, unit, color }: MacroCardProps) {
  return (
    <div className={`rounded-2xl p-6 text-center shadow-md ${color}`}>
      <p className="text-sm uppercase">{label}</p>
      <p className="text-2xl font-bold mt-2">
        {value} {unit}
      </p>
    </div>
  );
}

export default App;
