const mongoose = require("mongoose")

const savedRecipeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    recipes: [
      {
        recipeId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
        sourceUrl: {
          type: String,
        },
        position: {
          type: Number,
          required: true,
        },
        isFavorite: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const SavedRecipe = mongoose.model("SavedRecipe", savedRecipeSchema)
module.exports = SavedRecipe

