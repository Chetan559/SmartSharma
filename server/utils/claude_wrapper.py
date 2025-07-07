import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def stream_claude_response(prompt):
    try:
        # Initialize the client
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
        # Check if API key exists
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        
        # Create streaming response
        with client.messages.stream(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        ) as stream:
            for chunk in stream:
                if chunk.type == "content_block_delta":
                    print(chunk.delta.text, end="", flush=True)
        
        print()  # Add newline at the end
        
    except Exception as e:
        print(f"Error: {e}")

def main():
    print("Claude Streaming Chat (type 'quit' to exit)")
    print("-" * 40)
    
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            if user_input.strip():
                print("Claude: ", end="")
                stream_claude_response(user_input)
            else:
                print("Please enter a message.")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()