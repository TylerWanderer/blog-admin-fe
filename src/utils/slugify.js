// Turns a title into a slug the API accepts: lowercase words joined by single
// hyphens (^[a-z0-9]+(?:-[a-z0-9]+)*$). "Học AWS: Lambda & S3" -> "hoc-aws-lambda-s3".
export function slugify(text, maxLength = 200) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents: "é" -> "e"
    .toLowerCase()
    .replace(/đ/g, 'd') // "đ" has no accent-free decomposition
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '')
}
