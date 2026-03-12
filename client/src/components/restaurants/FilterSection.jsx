import { useState } from "react";
import axios from "axios";
import API from "../../api";

function FilterSection({ setRestaurants, refreshRestaurants }) {
    const [filter, setFilter] = useState({
        cuisine: "",
        maxCost: "",
        vegOnly: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilter({
            ...filter,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleFilter = async () => {
        try {
            const res = await axios.post(`${API}/restaurants/filter`, {
                cuisine: filter.cuisine || undefined,
                vegOnly: filter.vegOnly,
                maxCost: filter.maxCost
                    ? Number(filter.maxCost)
                    : undefined
            });

            setRestaurants(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNearby = async () => {
        try {
            const res = await axios.post(`${API}/restaurants/nearby`, {
                latitude: 12.9716,
                longitude: 77.5946,
                maxDistance: 5000
            });

            setRestaurants(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Filter Restaurants</h2>

            <select
                name="cuisine"
                value={filter.cuisine}
                onChange={handleChange}
            >
                <option value="">All Cuisines</option>
                <option value="South Indian">South Indian</option>
                <option value="North Indian">North Indian</option>
                <option value="Continental">Continental</option>
            </select>

            <input
                type="number"
                name="maxCost"
                placeholder="Max Cost"
                value={filter.maxCost}
                onChange={handleChange}
            />

            <div className="checkbox-group">
                <input
                    type="checkbox"
                    name="vegOnly"
                    checked={form.vegOnly}
                    onChange={handleChange}
                />
                <label>Veg Only</label>
            </div>

            <button onClick={handleFilter}>Apply Filter</button>
            <button onClick={refreshRestaurants}>Reset</button>
            <button onClick={handleNearby}>Nearby (5km)</button>
        </div>
    );
}

export default FilterSection;