using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TushGptBackend.Utils
{
    public class FlexibleStringConverter : JsonConverter<string>
    {
        public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Number)
            {
                // Convert numeric tokens to their string representation
                return reader.GetRawString();
            }
            if (reader.TokenType == JsonTokenType.String)
            {
                return reader.GetString();
            }
            if (reader.TokenType == JsonTokenType.Null)
            {
                return string.Empty;
            }
            if (reader.TokenType == JsonTokenType.True) return "true";
            if (reader.TokenType == JsonTokenType.False) return "false";

            // Support other types if needed, or fallback to default
            return string.Empty;
        }

        public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value);
        }
    }

    public static class Utf8JsonReaderExtensions
    {
        public static string GetRawString(this Utf8JsonReader reader)
        {
            using (var doc = JsonDocument.ParseValue(ref reader))
            {
                return doc.RootElement.GetRawText();
            }
        }
    }
}
