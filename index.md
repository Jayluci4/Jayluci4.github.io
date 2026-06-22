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
    {% assign post_word_count = post.content | strip_html | number_of_words %}
    {% assign post_reading_minutes = post_word_count | plus: 199 | divided_by: 200 %}
    {% if post_reading_minutes < 1 %}
      {% assign post_reading_minutes = 1 %}
    {% endif %}
    <article class="post-card">
      <div class="post-card-header">
        <a class="post-card-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <div class="post-card-meta">
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
          <span>{{ post_reading_minutes }} minute read</span>
        </div>
      </div>
      <p>{{ post.excerpt | strip_html | normalize_whitespace | truncate: 170 }}</p>
    </article>
  {% endfor %}
</section>
