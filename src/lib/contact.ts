/**
 * Where the public writes to us.
 *
 * One constant because this address was hardcoded in seven files, and
 * changing it meant finding all seven. A missed one doesn't break a
 * build — it quietly sends a customer somewhere nobody reads.
 *
 * NOT the same thing as the lumanai.events@gmail.com Google account that
 * owns the Calendar, Drive and the Command Center. Those stay as they
 * are; this is the address on the website.
 */
export const CONTACT_EMAIL = "bula@lumanai.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
