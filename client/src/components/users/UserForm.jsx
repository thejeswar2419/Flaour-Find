import { useState } from "react";
import axios from "axios";
import API from "../../api";

function UserForm({ refreshUsers }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        preferredCuisine: "",
        budget: "",
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

        await axios.post(`${API}/users`, {
            ...form,
            budget: Number(form.budget),
            location: {
                type: "Point",
                coordinates: [77.5946, 12.9716]
            }
        });

        setForm({
            name: "",
            email: "",
            preferredCuisine: "",
            budget: "",
            vegOnly: false
        });


    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="preferredCuisine" placeholder="Preferred Cuisine" value={form.preferredCuisine} onChange={handleChange} />
            <input type="number" name="budget" placeholder="Budget" value={form.budget} onChange={handleChange} />

            <div className="checkbox-group">
                <input
                    type="checkbox"
                    name="vegOnly"
                    checked={form.vegOnly}
                    onChange={handleChange}
                />
                <label>Veg Only</label>
            </div>

            <button type="submit">Add User</button>
        </form>
    );
}

export default UserForm;