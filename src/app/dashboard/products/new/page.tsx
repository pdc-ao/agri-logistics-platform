import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
  // ✅ Ensure user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Define categories based on your schema
  // According to your ProductListing model, category is a string field
  const categories = [
    { id: "grains-cereals", name: "Grains & Cereals" },
    { id: "fruits", name: "Fruits" },
    { id: "vegetables", name: "Vegetables" },
    { id: "livestock", name: "Livestock" },
    { id: "dairy", name: "Dairy Products" },
    { id: "poultry", name: "Poultry" },
    { id: "fish-seafood", name: "Fish & Seafood" },
    { id: "nuts-seeds", name: "Nuts & Seeds" },
    { id: "spices-herbs", name: "Spices & Herbs" },
    { id: "processed", name: "Processed Foods" },
    { id: "other", name: "Other" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create New Product</h1>
      <form
        action="/api/products"
        method="POST"
        className="space-y-4 max-w-lg"
      >
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            name="category"
            required
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            name="price"
            step="0.01"
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={4}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Save Product
        </button>
      </form>
    </div>
  );
}