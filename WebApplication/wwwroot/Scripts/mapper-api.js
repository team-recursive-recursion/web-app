var api = function () {
//    this.url = prompt("Enter server URL:", "http://localhost:5001");
//    this.courseId = "3428bb12-3c87-4c4c-951f-311eca2d5d38";
};

api.getPolygons = function (courseName, callback) {
    $.get("http://" + this.url + "/golfCourse/GetPolygons?courseId=" + 
        api.courseId,
        function(data, status) {
            alert("Data: " + data + "\n" + status);
            if (status) {
                apiPolygons = data;
                createCourse(data);
            } else {
                alert("Failed to load course.\ncourseId: " + api.courseId);
            }
        }
    );
}

api.addPolygon = function (courseId, data, type, callback) {
    $.post("http://" + this.url + "/golfCourse/AddPolygon",
        {
            courseId: courseId,
            geoJson: data,
            Type: type
        },
        function (returnedData) {
            apiPolygons = data;
            callback(returnedData);
        }
    )
}

/*
api.getCourses = function (courseName, callback) {
    $.get(this.url + "/GolfCourse/GetPolygons?courseId=" + this.courseId,
        function(data, status) {
            alert("Data: " + data + "\n" + status);
        });
}
*/

api.createCourse = function (courseName, callback) {
    $.post("http://" + this.url + "/GolfCourse/CreateCourse", 
        {CourseName: courseName},
        function (returnedData) {
            callback(returnedData);
        }
    );
};
        
        
       
