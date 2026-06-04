package supabase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	baseURL    string
	secretKey  string
	httpClient *http.Client
}

func NewClient(baseURL, secretKey string) *Client {
	return &Client{
		baseURL:   strings.TrimRight(baseURL, "/"),
		secretKey: secretKey,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (c *Client) Select(table string, query url.Values, out any) error {
	return c.request(http.MethodGet, table, query, nil, out, "")
}

func (c *Client) Insert(table string, payload any, out any) error {
	return c.request(http.MethodPost, table, nil, payload, out, "return=representation")
}

func (c *Client) Patch(table string, query url.Values, payload any, out any) error {
	return c.request(http.MethodPatch, table, query, payload, out, "return=representation")
}

func (c *Client) request(method, table string, query url.Values, payload any, out any, prefer string) error {
	if c.baseURL == "" || c.secretKey == "" {
		return fmt.Errorf("supabase is not configured")
	}

	var body io.Reader
	if payload != nil {
		buffer, err := json.Marshal(payload)
		if err != nil {
			return err
		}
		body = bytes.NewReader(buffer)
	}

	endpoint := fmt.Sprintf("%s/rest/v1/%s", c.baseURL, table)
	if len(query) > 0 {
		endpoint += "?" + query.Encode()
	}

	req, err := http.NewRequest(method, endpoint, body)
	if err != nil {
		return err
	}

	req.Header.Set("apikey", c.secretKey)
	req.Header.Set("Authorization", "Bearer "+c.secretKey)
	req.Header.Set("Content-Type", "application/json")
	if prefer != "" {
		req.Header.Set("Prefer", prefer)
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	responseBody, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("supabase %s %s failed with %d: %s", method, table, res.StatusCode, string(responseBody))
	}

	if out == nil || len(responseBody) == 0 {
		return nil
	}

	return json.Unmarshal(responseBody, out)
}
