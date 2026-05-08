using System.Text;
using System.Text.Json;
using TushGptBackend.Models.RocketPay.Dtos;

namespace TushGptBackend.Services
{
    /// <summary>
    /// Custom exception that carries the full RocketPay error body
    /// so controllers can return it verbatim to the caller.
    /// </summary>
    public class RocketPayException : Exception
    {
        public int StatusCode { get; }
        public string RawBody { get; }
        public RocketPayException(int statusCode, string rawBody)
            : base($"RocketPay returned HTTP {statusCode}: {rawBody}")
        {
            StatusCode = statusCode;
            RawBody = rawBody;
        }
    }

    public class RocketPayApiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RocketPayApiService> _logger;
        private readonly string _baseUrl;

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        public RocketPayApiService(HttpClient httpClient, IConfiguration configuration, ILogger<RocketPayApiService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _baseUrl = configuration["RocketPay:BaseUrl"] ?? "https://api-staging.rocketpay.co.in";
            var token = configuration["RocketPay:Token"] ?? string.Empty;
            // DISTRIBUTOR accounts use DISTRIBUTOR_API context; MERCHANT accounts use MERCHANT_API
            var appContext = configuration["RocketPay:AppContext"] ?? "MERCHANT_API";

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("x-app-context", appContext);
            _httpClient.DefaultRequestHeaders.Add("x-token", token);

            _logger.LogInformation("[RocketPay] Initialized. BaseUrl={BaseUrl}, AppContext={AppContext}", _baseUrl, appContext);
        }

        // ── helper ────────────────────────────────────────────────────────────────

        private async Task<(T? Data, string RawJson)> ReadAsync<T>(HttpResponseMessage response)
        {
            var raw = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("[RocketPay] HTTP {Status} body: {Body}", (int)response.StatusCode, raw);

            if (!response.IsSuccessStatusCode)
                throw new RocketPayException((int)response.StatusCode, raw);

            var data = JsonSerializer.Deserialize<T>(raw, _jsonOptions);
            return (data, raw);
        }

        private async Task<(List<T>? Data, string RawJson)> ReadListAsync<T>(HttpResponseMessage response)
        {
            var raw = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("[RocketPay] HTTP {Status} body: {Body}", (int)response.StatusCode, raw);

            if (!response.IsSuccessStatusCode)
                throw new RocketPayException((int)response.StatusCode, raw);

            var data = JsonSerializer.Deserialize<List<T>>(raw, _jsonOptions);
            return (data, raw);
        }

        private StringContent Json<T>(T dto) =>
            new(JsonSerializer.Serialize(dto, _jsonOptions), Encoding.UTF8, "application/json");

        // ── MANDATE APIs ─────────────────────────────────────────────────────────

        public async Task<(MandateResponseDto? Data, string RawJson)> CreateMandateAsync(MandateRequestDto dto)
        {
            _logger.LogInformation("[RocketPay] CreateMandate request: {Body}", JsonSerializer.Serialize(dto, _jsonOptions));
            var response = await _httpClient.PostAsync($"{_baseUrl}/v4/mandates", Json(dto));
            return await ReadAsync<MandateResponseDto>(response);
        }

        public async Task<(MandateResponseDto? Data, string RawJson)> GetMandateAsync(string mandateId)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/v4/mandates/{mandateId}");
            return await ReadAsync<MandateResponseDto>(response);
        }

        public async Task<(MandateResponseDto? Data, string RawJson)> RefreshMandateAsync(string mandateId)
        {
            var response = await _httpClient.PostAsync($"{_baseUrl}/v4/mandates/{mandateId}/refresh", null);
            return await ReadAsync<MandateResponseDto>(response);
        }

        public async Task<(MandateResponseDto? Data, string RawJson)> DeleteMandateAsync(string mandateId)
        {
            var request = new HttpRequestMessage(HttpMethod.Delete, $"{_baseUrl}/v4/mandates/{mandateId}");
            var response = await _httpClient.SendAsync(request);
            return await ReadAsync<MandateResponseDto>(response);
        }

        public async Task<(MandateResponseDto? Data, string RawJson)> CancelMandateAsync(string mandateId)
        {
            var response = await _httpClient.PostAsync($"{_baseUrl}/v4/mandates/{mandateId}/cancel", null);
            return await ReadAsync<MandateResponseDto>(response);
        }

        // ── INSTALLMENT APIs ─────────────────────────────────────────────────────

        public async Task<(List<InstallmentResponseDto>? Data, string RawJson)> GetInstallmentsByMandateAsync(string mandateId)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/v4/installments?mandate_id={mandateId}");
            return await ReadListAsync<InstallmentResponseDto>(response);
        }

        public async Task<(InstallmentResponseDto? Data, string RawJson)> GetInstallmentAsync(string installmentId)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/v4/installments/{installmentId}");
            return await ReadAsync<InstallmentResponseDto>(response);
        }

        public async Task<(InstallmentResponseDto? Data, string RawJson)> RefreshInstallmentAsync(string installmentId)
        {
            var response = await _httpClient.PostAsync($"{_baseUrl}/v4/installments/{installmentId}/refresh", null);
            return await ReadAsync<InstallmentResponseDto>(response);
        }

        public async Task<(InstallmentResponseDto? Data, string RawJson)> SkipInstallmentAsync(string installmentId)
        {
            var response = await _httpClient.PostAsync($"{_baseUrl}/v4/installments/{installmentId}/skip", null);
            return await ReadAsync<InstallmentResponseDto>(response);
        }

        public async Task<(InstallmentResponseDto? Data, string RawJson)> RetryInstallmentAsync(string installmentId, RetryInstallmentRequestDto dto)
        {
            var response = await _httpClient.PostAsync($"{_baseUrl}/v4/installments/{installmentId}/retry", Json(dto));
            return await ReadAsync<InstallmentResponseDto>(response);
        }

        public async Task<(InstallmentResponseDto? Data, string RawJson)> CreateInstallmentAsync(string mandateId, CreateInstallmentRequestDto dto)
        {
            var response = await _httpClient.PostAsync($"{_baseUrl}/v4/mandates/{mandateId}/installment", Json(dto));
            return await ReadAsync<InstallmentResponseDto>(response);
        }
    }
}
