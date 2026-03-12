function RestaurantList({ restaurants }) {
    if (!restaurants || restaurants.length === 0) {
        return <p>No restaurants available.</p>;
    }

    return (
        <>
            {restaurants.map((r) => (
                <div key={r._id} className="card">
                    <h3>{r.name}</h3>
                    <p><strong>Cuisine:</strong> {r.cuisine}</p>
                    <p><strong>Rating:</strong> {r.rating || "N/A"}</p>
                    <p><strong>Average Cost:</strong> ₹{r.averageCost}</p>
                    <p>
                        <strong>Type:</strong>{" "}
                        {r.vegOnly ? "Vegetarian Only" : "Veg & Non-Veg"}
                    </p>
                </div>
            ))}
        </>
    );
}

export default RestaurantList;