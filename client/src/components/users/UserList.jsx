function UserList({ users }) {
    return (
        <>
            {users.map((u) => (
                <div key={u._id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                    <strong>{u.name}</strong><br />
                    Email: {u.email}<br />
                    Cuisine: {u.preferredCuisine}<br />
                    Budget: ₹{u.budget}<br />
                    {u.vegOnly ? "Veg Only" : "Veg & Non-Veg"}
                </div>
            ))}
        </>
    );
}

export default UserList;