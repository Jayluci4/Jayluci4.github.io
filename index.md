---
layout: default
---

Notes and analysis on low-level AI infrastructure, kernel optimization, and bare-metal performance.

### System Logs
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> - {{ post.date | date: "%Y-%m-%d" }}
    </li>
  {% endfor %}
</ul>
