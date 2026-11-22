import { useState } from 'react'
import type { FormEvent } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../amplify/data/resource'
import './App.css'
import ReactMarkdown from 'react-markdown'

const client = generateClient<Schema>()

function App() {
  const [ingredients, setIngredients] = useState('')
  const [recipe, setRecipe] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const ingredientList = ingredients
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (ingredientList.length === 0) {
      setError('Please enter at least one ingredient.')
      return
    }

    setLoading(true)
    setError('')
    setRecipe('')

    try {
      const { data, errors } = await client.queries.askBedrock({
        ingredients: ingredientList,
      })

      if (errors?.length) {
        throw new Error(errors.map((item) => item.message).join(', '))
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      if (!data?.body) {
        throw new Error('No recipe was returned.')
      }

      setRecipe(data.body)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to generate recipe.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="recipe-app">
      <div className="recipe-container">
        <div className="recipe-header">
          <span className="recipe-icon">🍳</span>
          <h1>AI Recipe Generator</h1>
          <p>Turn your ingredients into something delicious!</p>
          <p className="creator">Created by Celia Gonzalez</p>
        </div>

        <form onSubmit={generateRecipe} className="recipe-form">
          <h2>What's in your kitchen?</h2>
          <p>Enter your ingredients separated by commas.</p>

          <textarea
            value={ingredients}
            onChange={(event) => setIngredients(event.target.value)}
            placeholder="Example: chicken, rice, broccoli, garlic"
            rows={4}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Generating your recipe...' : '✨ Generate Recipe'}
          </button>
        </form>

        {error && (
          <div className="recipe-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {recipe && (
          <section className="recipe-result">
            <h2>🍽️ Your AI-Generated Recipe</h2>
            <div className="recipe-text">
              <ReactMarkdown>{recipe}</ReactMarkdown>
            </div>
          </section>
        )}

        <footer>Powered by AWS Amplify & Amazon Bedrock</footer>
      </div>
    </main>
  )
}

export default App
