# Instructions for running the server:

You can run the pipeline by the following command:

```
./bin/docker-web.sh test.txt
```

Then, go to the link:

```
http://localhost:4000/food/static/simple.html
```

If you want to delete the webCache, it is located in:

```
./cartograph-server/experiment/food/0004/webCache
```

# Problem Description:

The part of code to add labels is located in ```CountryService.py``` lines 39-50, in the function ```addLayers``` . My understanding of this 
function is that, if the zoom level is smaller than a threshold, we don't add country labels. Otherwise, only when we zoom in enough, 
we add a point representing the label of the polygon, which is the center of the polygon. 

When you explore the map (you can see the zoom level in the url, e.g. http://localhost:4000/food/static/simple.html#cluster/4.167368926400075/-27.475/-35.742 indicates that the zoom level is 4.167368926400075), you can see that only when we zoom in more than the threshold,
the labels show up. 

This phenomenon I'm describing is easy to observe if you zoom in on the two countries on the lower
left corner, where the labels show up when the zoom level is above 5. 

If we set the zoom level to be small, e.g. 2, there will be multiple countries in the screen and 
therefore mess up the labels. If you try setting the threshold to be 2, you will see that J is the label for multiple
countries, this is because the labels get overwritten since there are many countries
within the screen when the zoom level is 2. 

Besides, there is some new problem that I have not encountered when running the same code
 in Cartograph. For example, in the green country on the upper left corner, even though I 
set the threshold to be 5, the labels show up when the zoom level exceeds 6. I have not encountered 
this problem before when running the same thing in Cartograph, so I'm not sure if it is because we messed up 
somehow with the server repo. 

To sum up my problem: if we want to see the label for a country, 
we have to zoom in such that we can only see one country in the visible range, 
which might lose the potential benefit of having labels. I haven't figured out how to solve this. Thank you for your help and insights!