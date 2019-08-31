const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const xmlhttprequest = require('xmlhttprequest');
const fs = require('fs');
const bodyparser = require('body-parser');

module.exports = {
    express, request, cheerio,
    async, xmlhttprequest, fs,
    bodyparser
};
