---
layout: page
title: Webhooks
permalink: /webhooks
nav_order: 120
---

# Webhooks

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
   {:toc}

---

ExpoFP webhooks are a simple way to get notified when event occurred on ExpoFP.com.

[Configure webhooks](https://expofp.com/client/profile){: .btn }

When configured, ExpoFP will perform `HTTP POST` requests to the webhook URL with JSON payload.
You can use one of helper online tools to see coming data from webhooks. E.g. <https://requestbin.com/>

# booth_reserved

Example payload:

```json
{
    "type": "booth_reserved",
    "exhibitorId": 123
}
```

<!-- # exhibitor_upgraded

Example payload:

```json
{
    "type": "exhibitor_upgraded",
    "exhibitorId": 123
}
``` -->
