import { useState } from "react";
import axios from "axios";
import API from "../../api";

function RestaurantForm({ refreshRestaurants }) {
    const [form, setForm] = useState({
        name: "",
        cuisine: "",
        averageCost: "",
        rating: "",
        vegOnly: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await axios.post(`${API}/restaurants`, {
            ...form,
            averageCost: Number(form.averageCost),
            rating: Number(form.rating),
            location: {
                type: "Point",
                coordinates: [77.5946, 12.9716]
            }
        });

        setForm({
            name: "",
            cuisine: "",
            averageCost: "",
            rating: "",
            vegOnly: false
        });

        refreshRestaurants();
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input name="cuisine" placeholder="Cuisine" value={form.cuisine} onChange={handleChange} required />
            <input type="number" name="averageCost" placeholder="Average Cost" value={form.averageCost} onChange={handleChange} required />
            <input type="number" step="0.1" name="rating" placeholder="Rating" value={form.rating} onChange={handleChange} />

            <div className="checkbox-group">
                <input
                    type="checkbox"
                    name="vegOnly"
                    checked={form.vegOnly}
                    onChange={handleChange}
                />
                <label>Veg Only</label>
            </div>

            <button type="submit">Add Restaurant</button>
        </form>
    );
}

export default RestaurantForm;