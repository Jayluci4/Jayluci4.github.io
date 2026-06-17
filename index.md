---
layout: default
title: System Logs
---

<section class="home-intro">
  <p class="eyebrow">Low-level AI infrastructure</p>
  <h1>System Logs</h1>
  <p>Notes on hardware architecture, networking, kernel optimization, and bare-metal performance.</p>
</section>

<section class="post-index" aria-label="Recent posts">
  {% for post in site.posts %}
    <article class="post-card">
      <div class="post-card-header">
        <a class="post-card-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
      </div>
      <p>{{ post.excerpt | strip_html | normalize_whitespace | truncate: 170 }}</p>
    </article>
  {% endfor %}
</section>
