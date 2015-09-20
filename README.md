# StatsD output for Minigun stats

This [Minigun](https://artillery.io/minigun) plugin allows you to publish the
stats produced by Minigun to StatsD in real-time.

## Usage

Enable the plugin by adding it in your test script's `config.plugins` section:

```javascript
{
  "config": {
    // ...
    "plugins": {
      "statsd": {
        "host": "localhost",
        "port": 8125,
        "prefix": "minigun"
      }
    }
  }
  // ...
}
```

`host`, `port`, and `prefix` are optional; the values above are the defaults.

### Published metrics

- `scenariosCreated`
- `scenariosCompleted`
- `requestsCompleted`
- `latency.min`
- `latency.max`
- `latency.median`
- `latency.p95`
- `latency.p99`
- `errors.ECONNREFUSED`, `errors.ETIMEDOUT` etc

### Using with Librato

This plugin can be used to publish metrics to [Librato](https://www.librato.com):

0. Install StatsD with:

  `npm install statsd`

1. Add Librato backend to StatsD:

  `cd /path/to/statsd`
  `npm install statsd-librato-backend`

  Enable the backend in your StatsD config:

  ```javascript
  {
    librato: {
      email:  "mylibrato@email.com",
      token:  "a161e2bc22b1bdd0cfe90412token10498token22dd52cat792doge1ab5a1d32"
    },
    backends: ['statsd-librato-backend']
  }
  ```

3. Run StatsD and use Minigun with this plugin.

## License

**minigun-plugin-statsd** is distributed under the terms of the
[ISC](http://en.wikipedia.org/wiki/ISC_license) license.
